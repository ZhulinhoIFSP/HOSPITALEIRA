export type StatusConsulta = 'AGENDADA' | 'CONFIRMADA' | 'CHECK_IN' | 'REALIZADA' | 'CANCELADA';
export interface Consulta { id: number; pacienteId: number; medicoId: number; data: string; horario: string; status: StatusConsulta; createdAt: string; updatedAt: string; }
export interface Paciente { id: number; nome: string; }
export interface Medico { id: number; nome: string; especialidade: string; }
export type DadosConsulta = Pick<Consulta, 'pacienteId' | 'medicoId' | 'data' | 'horario'>;
