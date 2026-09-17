export type StatusConsulta = 'AGENDADA' | 'CONFIRMADA' | 'CHECK_IN' | 'REALIZADA' | 'CANCELADA';
export interface Consulta { id: number; pacienteId: number; medicoId: number; data: string; horario: string; status: StatusConsulta; createdAt: string; updatedAt: string; }
