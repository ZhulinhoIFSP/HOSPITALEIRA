import { BusinessRuleError } from '../../../core/errors/domain.error';
import { ConsultaAcao } from '../../enums/consulta-acao.enum';
import { TransitionContext } from '../transition-context';
import { ITransitionGuard } from '../transition-guard.interface';

/**
 * Guarda de Transição responsável por exigir justificativa formal ao cancelar.
 * Princípio da Responsabilidade Única (SRP).
 */
export class JustificativaCancelamentoGuard implements ITransitionGuard {
  readonly nome = 'JustificativaCancelamentoGuard';

  validate(acao: ConsultaAcao, context: TransitionContext): void {
    if (acao !== 'CANCELAR') {
      return;
    }

    const justificativa = context.payload?.justificativa?.trim();
    if (!justificativa || justificativa.length < 5) {
      throw new BusinessRuleError(
        'Guarda de Transição violada: O cancelamento da consulta exige uma justificativa formal com no mínimo 5 caracteres.',
      );
    }
  }
}
