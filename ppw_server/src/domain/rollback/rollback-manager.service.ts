import { Injectable } from '@nestjs/common';
import { LiberarAgendaRollbackHandler } from './handlers/liberar-agenda.handler';
import { LiberarSalaRollbackHandler } from './handlers/liberar-sala.handler';
import { RemoverFilaEsperaRollbackHandler } from './handlers/remover-fila-espera.handler';
import { IRollbackHandler, RollbackContext } from './rollback-handler.interface';

/**
 * Gerenciador de Rollback e Ações Compensatórias.
 * Aplica os princípios SOLID:
 * - SRP: Responsável unicamente pela coordenação das compensações em cancelamentos parciais.
 * - OCP: Aberto para novos tipos de compensação através de `registrarHandler()`.
 * - LSP: Executa qualquer handler que respeita a interface IRollbackHandler.
 */
@Injectable()
export class RollbackManagerService {
  private readonly handlers: IRollbackHandler[] = [
    new LiberarAgendaRollbackHandler(),
    new LiberarSalaRollbackHandler(),
    new RemoverFilaEsperaRollbackHandler(),
  ];

  registrarHandler(handler: IRollbackHandler): void {
    this.handlers.push(handler);
  }

  getHandlers(): IRollbackHandler[] {
    return [...this.handlers];
  }

  async executarRollback(context: RollbackContext): Promise<string[]> {
    const compensacoesExecutadas: string[] = [];

    for (const handler of this.handlers) {
      const resultado = await handler.executar(context);
      compensacoesExecutadas.push(resultado);
    }

    return compensacoesExecutadas;
  }
}
