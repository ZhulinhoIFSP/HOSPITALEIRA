import { Consulta } from '../entities/consulta.entity';

export interface RollbackContext {
  consulta: Consulta;
  motivo: string;
  actorId: number;
  actorRole: string;
}

/**
 * Interface para Handlers de Ações Compensatórias (Rollback Parcial).
 * Princípio da Substituição de Liskov (LSP) e Aberto/Fechado (OCP):
 * Novos estornos e ações compensatórias podem ser criados de forma intercambiável.
 */
export interface IRollbackHandler {
  readonly nome: string;
  executar(context: RollbackContext): Promise<string> | string;
}
