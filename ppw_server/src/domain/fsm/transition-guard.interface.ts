import { ConsultaAcao } from '../enums/consulta-acao.enum';
import { TransitionContext } from './transition-context';

/**
 * Interface canônica para Guardas de Transição (Transition Guards).
 * Respeita o Princípio de Substituição de Liskov (LSP) e o Princípio Aberto/Fechado (OCP):
 * Qualquer guarda pode ser substituída ou novas guardas podem ser adicionadas sem alterar a máquina de estados.
 */
export interface ITransitionGuard {
  readonly nome: string;
  validate(acao: ConsultaAcao, context: TransitionContext): Promise<void> | void;
}
