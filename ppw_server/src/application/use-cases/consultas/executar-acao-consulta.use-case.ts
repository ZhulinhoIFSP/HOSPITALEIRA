import { Inject, Injectable } from '@nestjs/common';
import { ConflictError, NotFoundError } from '../../../core/errors/domain.error';
import { Consulta } from '../../../domain/entities/consulta.entity';
import { ConsultaAcao } from '../../../domain/enums/consulta-acao.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { ConsultaStateMachine } from '../../../domain/fsm/consulta-state-machine';
import { TransitionContext, TransitionPayload } from '../../../domain/fsm/transition-context';
import { CONSULTA_REPOSITORY, IConsultaRepository } from '../../../domain/repositories/consulta.repository.interface';
import {
  HISTORICO_CONSULTA_REPOSITORY,
  IHistoricoConsultaRepository,
} from '../../../domain/repositories/historico-consulta.repository.interface';
import { RollbackManagerService } from '../../../domain/rollback/rollback-manager.service';
import { ITransactionManager, TRANSACTION_MANAGER } from '../../../domain/transaction/transaction-manager.interface';

export interface ExecutarAcaoConsultaInput {
  acao: ConsultaAcao;
  actorId: number;
  actorRole: UserRole;
  payload?: TransitionPayload;
  version?: number;
}

@Injectable()
export class ExecutarAcaoConsultaUseCase {
  constructor(
    @Inject(CONSULTA_REPOSITORY)
    private readonly consultaRepository: IConsultaRepository,
    @Inject(HISTORICO_CONSULTA_REPOSITORY)
    private readonly historicoRepository: IHistoricoConsultaRepository,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: ITransactionManager,
    private readonly rollbackManagerService: RollbackManagerService,
  ) {}

  async execute(id: number, input: ExecutarAcaoConsultaInput): Promise<Consulta> {
    const consulta = await this.consultaRepository.findById(id);
    if (!consulta) {
      throw new NotFoundError(`Consulta #${id} não encontrada.`);
    }

    // CONTROLE DE CONCORRÊNCIA OTIMISTA (OCC)
    if (input.version !== undefined && input.version !== consulta.version) {
      throw new ConflictError(
        `Conflito de concorrência detectado (OCC): a consulta #${id} foi alterada por outro usuário simultaneamente (Versão informada: ${input.version}, Versão no banco: ${consulta.version}).`,
      );
    }

    const context: TransitionContext = {
      consulta,
      actorId: input.actorId,
      actorRole: input.actorRole,
      payload: input.payload,
    };

    // Executa a transição orientada a evento na Máquina de Estados Finita (com RBAC e Transition Guards)
    const { dadosAtualizacao } = await ConsultaStateMachine.transicionar(input.acao, context);

    // Registro temporal de check-in para cálculo de SLA
    if (input.acao === 'CHECK_IN') {
      dadosAtualizacao.dataCheckIn = new Date().toISOString();
      dadosAtualizacao.slaEstourado = false;
      dadosAtualizacao.alertaEscalonamento = undefined;
    }

    // ROLLBACK / CANCELAMENTO PARCIAL
    if (input.acao === 'CANCELAR') {
      const compensacoes = await this.rollbackManagerService.executarRollback({
        consulta,
        motivo: input.payload?.justificativa ?? 'Cancelamento manual.',
        actorId: input.actorId,
        actorRole: input.actorRole,
      });
      dadosAtualizacao.compensacoesExecutadas = compensacoes;
    }

    // TRANSAÇÃO DE BANCO DE DADOS (ACID TRANSACTION) - Item 1.C
    // Nenhuma alteração de estado crítica pode sobrescrever dados sem histórico.
    // A tabela de histórico vinculada é alimentada de forma atômica: se falhar o log ou o update, faz Rollback.
    return await this.transactionManager.executarEmTransacao(async () => {
      const atualizada = await this.consultaRepository.update(id, dadosAtualizacao);
      if (!atualizada) {
        throw new NotFoundError(`Consulta #${id} não encontrada.`);
      }

      const justificativa =
        input.payload?.justificativa?.trim() ||
        `Ação '${input.acao}' executada por perfil '${input.actorRole}'.`;

      await this.historicoRepository.create({
        consultaId: atualizada.id,
        estadoAnterior: consulta.status,
        novoEstado: atualizada.status,
        autorId: input.actorId,
        autorRole: input.actorRole,
        justificativa,
        versao: atualizada.version,
        detalhes: {
          acao: input.acao,
          prontuario: atualizada.prontuario,
          diagnostico: atualizada.diagnostico,
          compensacoes: atualizada.compensacoesExecutadas,
        },
      });

      return atualizada;
    });
  }
}
