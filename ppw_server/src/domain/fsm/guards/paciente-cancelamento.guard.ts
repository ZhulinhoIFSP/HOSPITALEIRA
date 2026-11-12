import { BusinessRuleError } from '../../../core/errors/domain.error';
import { ConsultaAcao } from '../../enums/consulta-acao.enum';
import { TransitionContext } from '../transition-context';
import { ITransitionGuard } from '../transition-guard.interface';

/**
 * Guarda de Transição que restringe o cancelamento por pacientes:
 * Pacientes só podem cancelar consultas nos estados 'AGENDADA' ou 'CONFIRMADA'.
 * Após o 'CHECK_IN' ou 'EM_ATENDIMENTO', o cancelamento só pode ser efetuado pela recepção, médico ou administrador.
 * Princípio da Responsabilidade Única (SRP).
 */
export class PacienteCancelamentoGuard implements ITransitionGuard {
  readonly nome = 'PacienteCancelamentoGuard';

  validate(acao: ConsultaAcao, context: TransitionContext): void {
    if (acao !== 'CANCELAR') {
      return;
    }

    if (context.actorRole === 'PACIENTE') {
      const estadosPermitidosParaPaciente = ['AGENDADA', 'CONFIRMADA'];
      if (!estadosPermitidosParaPaciente.includes(context.consulta.status)) {
        throw new BusinessRuleError(
          `Guarda de Transição violada: O paciente só pode cancelar consultas com status 'AGENDADA' ou 'CONFIRMADA'. Status atual: '${context.consulta.status}'. Procure a recepção.`,
        );
      }
    }
  }
}
