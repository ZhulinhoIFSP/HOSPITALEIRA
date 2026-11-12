import { IRollbackHandler, RollbackContext } from '../rollback-handler.interface';

/**
 * Ação compensatória: Estorno da fila de espera da recepção.
 * Se o paciente já havia realizado o 'CHECK_IN' antes do cancelamento, remove-o
 * da lista de presença ativa do consultório médico.
 * Princípio da Responsabilidade Única (SRP).
 */
export class RemoverFilaEsperaRollbackHandler implements IRollbackHandler {
  readonly nome = 'RemoverFilaEsperaRollbackHandler';

  executar(context: RollbackContext): string {
    const { consulta } = context;
    if (consulta.status === 'CHECK_IN') {
      return `FILA_ESPERA_ESTORNADA: Paciente #${consulta.pacienteId} removido da fila de presença da recepção.`;
    }
    return 'FILA_ESPERA_INALTERADA: Consulta não estava em sala de espera.';
  }
}
