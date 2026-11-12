export const TRANSACTION_MANAGER = 'TRANSACTION_MANAGER';

/**
 * Interface do Gerenciador de Transações de Banco de Dados (ACID Transaction).
 *
 * Garante que operações críticas (ex: transição de estado da consulta + inserção
 * no log de auditoria) ocorram de forma atômica: ou ambas são confirmadas (COMMIT)
 * ou, se qualquer falha ocorrer, o estado é totalmente desfeito (ROLLBACK).
 *
 * Princípio da Responsabilidade Única (SRP) e Inversão de Dependência (DIP).
 */
export interface ITransactionManager {
  executarEmTransacao<T>(operacao: () => Promise<T>): Promise<T>;
}
