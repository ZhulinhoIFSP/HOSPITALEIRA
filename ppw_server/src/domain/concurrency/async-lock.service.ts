import { Injectable } from '@nestjs/common';

/**
 * Serviço de Concorrência e Mutex Assíncrono (Async Keyed Lock).
 *
 * Resolve o problema de condição de corrida (Race Condition) e agendamento concorrente:
 * No projeto de Consultas (análogo ao Coworking de Kayky), se duas requisições tentarem
 * agendar o mesmo médico ou sala no mesmo horário simultaneamente, o Lock serializa o acesso
 * à seção crítica garantindo exclusão mútua.
 *
 * Princípio da Responsabilidade Única (SRP):
 * Responsável exclusivamente pelo gerenciamento de travas assíncronas por chave de recurso.
 */
@Injectable()
export class AsyncLockService {
  private readonly locks = new Map<string, Promise<void>>();

  /**
   * Adquire o lock para uma chave específica (ex: "medico:1:2026-10-01:09:00").
   * Retorna uma função de liberação (`release`) que deve ser chamada no bloco `finally`.
   */
  async acquire(key: string): Promise<() => void> {
    while (this.locks.has(key)) {
      await this.locks.get(key);
    }

    let releaseFn!: () => void;
    const promise = new Promise<void>((resolve) => {
      releaseFn = resolve;
    });

    this.locks.set(key, promise);

    return () => {
      this.locks.delete(key);
      releaseFn();
    };
  }

  /**
   * Executa uma tarefa protegida por lock com liberação automática garantida.
   */
  async withLock<T>(key: string, task: () => Promise<T>): Promise<T> {
    const release = await this.acquire(key);
    try {
      return await task();
    } finally {
      release();
    }
  }

  /**
   * Verifica se determinado recurso está sob lock ativo.
   */
  isLocked(key: string): boolean {
    return this.locks.has(key);
  }
}
