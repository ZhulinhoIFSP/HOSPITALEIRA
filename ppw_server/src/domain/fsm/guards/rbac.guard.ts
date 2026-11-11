import { ForbiddenError } from '../../../core/errors/domain.error';
import { ConsultaAcao } from '../../enums/consulta-acao.enum';
import { UserRole } from '../../enums/user-role.enum';
import { TransitionContext } from '../transition-context';
import { ITransitionGuard } from '../transition-guard.interface';

/**
 * Guarda de Transição responsável exclusivamente pela Matriz de Permissões (RBAC).
 * Princípio da Responsabilidade Única (SRP).
 */
export class RbacGuard implements ITransitionGuard {
  readonly nome = 'RbacGuard';

  constructor(private readonly papeisPermitidos: UserRole[]) {}

  validate(acao: ConsultaAcao, context: TransitionContext): void {
    if (!this.papeisPermitidos.includes(context.actorRole)) {
      throw new ForbiddenError(
        `Permissão negada: o perfil '${context.actorRole}' não possui permissão para executar a ação '${acao}' na consulta #${context.consulta.id}. Perfis autorizados: [${this.papeisPermitidos.join(', ')}].`,
      );
    }
  }
}
