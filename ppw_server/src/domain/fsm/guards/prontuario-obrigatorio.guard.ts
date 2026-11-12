import { BusinessRuleError } from '../../../core/errors/domain.error';
import { ConsultaAcao } from '../../enums/consulta-acao.enum';
import { TransitionContext } from '../transition-context';
import { ITransitionGuard } from '../transition-guard.interface';

/**
 * Guarda de Transição responsável por exigir o laudo médico / prontuário clínico e diagnóstico.
 * Análogo à regra da Maria Luiza (RMA que exige laudo técnico antes de avançar para "Em Reparo").
 * Aqui, não é possível transicionar a consulta para "REALIZADA" sem o preenchimento de prontuário e diagnóstico.
 * Princípio da Responsabilidade Única (SRP).
 */
export class ProntuarioObrigatorioGuard implements ITransitionGuard {
  readonly nome = 'ProntuarioObrigatorioGuard';

  validate(acao: ConsultaAcao, context: TransitionContext): void {
    if (acao !== 'CONCLUIR') {
      return;
    }

    const prontuario = context.payload?.prontuario?.trim();
    const diagnostico = context.payload?.diagnostico?.trim();

    if (!prontuario || prontuario.length < 5) {
      throw new BusinessRuleError(
        'Guarda de Transição violada: É obrigatório o preenchimento detalhado do laudo/prontuário médico (mínimo de 5 caracteres) para concluir a consulta.',
      );
    }

    if (!diagnostico || diagnostico.length < 3) {
      throw new BusinessRuleError(
        'Guarda de Transição violada: É obrigatório informar o diagnóstico clínico para concluir a consulta.',
      );
    }
  }
}
