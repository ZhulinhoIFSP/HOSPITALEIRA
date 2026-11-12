import { Inject, Injectable } from '@nestjs/common';
import { Consulta } from '../../../domain/entities/consulta.entity';
import { CONSULTA_REPOSITORY, IConsultaRepository } from '../../../domain/repositories/consulta.repository.interface';
import {
  HISTORICO_CONSULTA_REPOSITORY,
  IHistoricoConsultaRepository,
} from '../../../domain/repositories/historico-consulta.repository.interface';
import { RollbackManagerService } from '../../../domain/rollback/rollback-manager.service';
import { SlaManagerService } from '../../../domain/sla/sla-manager.service';
import { ITransactionManager, TRANSACTION_MANAGER } from '../../../domain/transaction/transaction-manager.interface';

export interface RelatorioProcessamentoSla {
  totalAvaliado: number;
  totalModificado: number;
  expiradas: { id: number; motivo: string; compensacoes: string[] }[];
  escalonadas: { id: number; alerta: string; prioridade: string }[];
}

@Injectable()
export class ProcessarSlaConsultasUseCase {
  constructor(
    @Inject(CONSULTA_REPOSITORY)
    private readonly consultaRepository: IConsultaRepository,
    @Inject(HISTORICO_CONSULTA_REPOSITORY)
    private readonly historicoRepository: IHistoricoConsultaRepository,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: ITransactionManager,
    private readonly slaManagerService: SlaManagerService,
    private readonly rollbackManagerService: RollbackManagerService,
  ) {}

  async execute(agora: Date = new Date()): Promise<RelatorioProcessamentoSla> {
    const consultas = await this.consultaRepository.findAll();
    const relatorio: RelatorioProcessamentoSla = {
      totalAvaliado: consultas.length,
      totalModificado: 0,
      expiradas: [],
      escalonadas: [],
    };

    for (const consulta of consultas) {
      if (consulta.isEstadoFinal()) {
        continue;
      }

      const { modificada, dadosAtualizacao } = this.slaManagerService.avaliarConsulta(consulta, agora);

      if (modificada) {
        relatorio.totalModificado++;

        if (dadosAtualizacao.status === 'CANCELADA') {
          const compensacoes = await this.rollbackManagerService.executarRollback({
            consulta,
            motivo: dadosAtualizacao.motivoCancelamento ?? 'Expiração de SLA.',
            actorId: 0,
            actorRole: 'SISTEMA_SLA',
          });
          dadosAtualizacao.compensacoesExecutadas = compensacoes;
          relatorio.expiradas.push({
            id: consulta.id,
            motivo: dadosAtualizacao.motivoCancelamento ?? 'Expiração de SLA',
            compensacoes,
          });
        }

        if (dadosAtualizacao.slaEstourado) {
          relatorio.escalonadas.push({
            id: consulta.id,
            alerta: dadosAtualizacao.alertaEscalonamento ?? 'Tempo de espera excedido',
            prioridade: dadosAtualizacao.prioridade ?? 'URGENTE',
          });
        }

        // Executa atualização e trilha de auditoria em transação atômica ACID
        await this.transactionManager.executarEmTransacao(async () => {
          const atualizada = await this.consultaRepository.update(consulta.id, dadosAtualizacao);
          if (atualizada && dadosAtualizacao.status && dadosAtualizacao.status !== consulta.status) {
            await this.historicoRepository.create({
              consultaId: consulta.id,
              estadoAnterior: consulta.status,
              novoEstado: dadosAtualizacao.status,
              autorId: 0,
              autorRole: 'SISTEMA_SLA',
              justificativa: dadosAtualizacao.motivoCancelamento ?? 'Expiração automática via SLA.',
              versao: atualizada.version,
              detalhes: {
                compensacoes: dadosAtualizacao.compensacoesExecutadas,
              },
            });
          }
        });
      }
    }

    return relatorio;
  }
}
