import { Inject, Injectable } from '@nestjs/common';
import { CONSULTA_REPOSITORY } from '../../domain/repositories/consulta.repository.interface';
import { HISTORICO_CONSULTA_REPOSITORY } from '../../domain/repositories/historico-consulta.repository.interface';
import { ITransactionManager } from '../../domain/transaction/transaction-manager.interface';
import { InMemoryConsultaRepository } from '../repositories/in-memory-consulta.repository';
import { InMemoryHistoricoConsultaRepository } from '../repositories/in-memory-historico-consulta.repository';

/**
 * Gerenciador de Transações ACID em Memória.
 *
 * Garante os 4 pilares ACID:
 * - Atomicidade (Atomicity): Todas as alterações (entidade + trilha de auditoria) ocorrem juntas;
 *   se houver qualquer falha, o snapshot anterior é restaurado integralmente (Rollback).
 * - Consistência (Consistency): Nenhuma alteração de estado deixa o histórico inconsistente.
 * - Isolamento (Isolation): As alterações só são consolidadas após a conclusão da operação.
 * - Durabilidade (Durability): Os dados consolidados persistem no repositório.
 */
@Injectable()
export class InMemoryTransactionManager implements ITransactionManager {
  constructor(
    @Inject(CONSULTA_REPOSITORY)
    private readonly consultaRepository: InMemoryConsultaRepository,
    @Inject(HISTORICO_CONSULTA_REPOSITORY)
    private readonly historicoRepository: InMemoryHistoricoConsultaRepository,
  ) {}

  async executarEmTransacao<T>(operacao: () => Promise<T>): Promise<T> {
    const consultaSnapshot = this.consultaRepository.getSnapshot();
    const historicoSnapshot = this.historicoRepository.getSnapshot();

    try {
      const resultado = await operacao();
      return resultado; // COMMIT da transação
    } catch (erro) {
      // ROLLBACK da transação ACID: restaura o estado de ambos os repositórios
      this.consultaRepository.restoreSnapshot(consultaSnapshot);
      this.historicoRepository.restoreSnapshot(historicoSnapshot);
      throw erro;
    }
  }
}
