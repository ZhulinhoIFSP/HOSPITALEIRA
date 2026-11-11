import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../core/errors/domain.error';
import { Consulta } from '../../../domain/entities/consulta.entity';
import { ConsultaAcao } from '../../../domain/enums/consulta-acao.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { ConsultaStateMachine } from '../../../domain/fsm/consulta-state-machine';
import { TransitionContext, TransitionPayload } from '../../../domain/fsm/transition-context';
import { CONSULTA_REPOSITORY, IConsultaRepository } from '../../../domain/repositories/consulta.repository.interface';

export interface ExecutarAcaoConsultaInput {
  acao: ConsultaAcao;
  actorId: number;
  actorRole: UserRole;
  payload?: TransitionPayload;
}

@Injectable()
export class ExecutarAcaoConsultaUseCase {
  constructor(
    @Inject(CONSULTA_REPOSITORY)
    private readonly consultaRepository: IConsultaRepository,
  ) {}

  async execute(id: number, input: ExecutarAcaoConsultaInput): Promise<Consulta> {
    const consulta = await this.consultaRepository.findById(id);
    if (!consulta) {
      throw new NotFoundError(`Consulta #${id} não encontrada.`);
    }

    const context: TransitionContext = {
      consulta,
      actorId: input.actorId,
      actorRole: input.actorRole,
      payload: input.payload,
    };

    // Executa a transição orientada a evento na Máquina de Estados Finita (com RBAC e Transition Guards)
    const { dadosAtualizacao } = await ConsultaStateMachine.transicionar(input.acao, context);

    const atualizada = await this.consultaRepository.update(id, dadosAtualizacao);
    if (!atualizada) {
      throw new NotFoundError(`Consulta #${id} não encontrada.`);
    }

    return atualizada;
  }
}
