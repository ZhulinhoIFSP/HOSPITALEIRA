import { IRollbackHandler, RollbackContext } from '../rollback-handler.interface';

/**
 * Ação compensatória: Liberação imediata do slot de agenda do médico.
 * Restaura a disponibilidade do horário para novos agendamentos no sistema.
 * Princípio da Responsabilidade Única (SRP).
 */
export class LiberarAgendaRollbackHandler implements IRollbackHandler {
  readonly nome = 'LiberarAgendaRollbackHandler';

  executar(context: RollbackContext): string {
    const { consulta } = context;
    // Em um sistema com banco relacional, atualiza a tabela de slots/grades médicas
    return `SLOT_AGENDA_LIBERADO: Médico #${consulta.medicoId} liberado em ${consulta.data} às ${consulta.horario}.`;
  }
}
