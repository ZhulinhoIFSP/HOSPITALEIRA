import { IRollbackHandler, RollbackContext } from '../rollback-handler.interface';

/**
 * Ação compensatória: Desalocação da sala/consultório médico reservado.
 * Retorna o recurso físico para o pool de disponibilidade da clínica.
 * Princípio da Responsabilidade Única (SRP).
 */
export class LiberarSalaRollbackHandler implements IRollbackHandler {
  readonly nome = 'LiberarSalaRollbackHandler';

  executar(context: RollbackContext): string {
    const { consulta } = context;
    if (!consulta.salaId) {
      return 'SALA_INALTERADA: Nenhuma sala física estava alocada para esta consulta.';
    }
    const salaId = consulta.salaId;
    return `SALA_DESALOCADA: Consultório/Sala #${salaId} desalocada e retornada ao pool de salas disponíveis.`;
  }
}
