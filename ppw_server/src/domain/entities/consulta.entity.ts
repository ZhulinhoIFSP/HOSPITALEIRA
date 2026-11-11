export type StatusConsulta =
  | 'AGENDADA'
  | 'CONFIRMADA'
  | 'CHECK_IN'
  | 'EM_ATENDIMENTO'
  | 'REALIZADA'
  | 'CANCELADA';

export class Consulta {
  constructor(
    public readonly id: number,
    public pacienteId: number,
    public medicoId: number,
    public data: string,
    public horario: string,
    public status: StatusConsulta,
    public readonly createdAt: string,
    public updatedAt: string,
    public prontuario?: string,
    public diagnostico?: string,
    public prescricao?: string,
    public motivoCancelamento?: string,
    public version: number = 1,
  ) {}

  static readonly TRANSICOES_PERMITIDAS: Record<StatusConsulta, StatusConsulta[]> = {
    AGENDADA: ['CONFIRMADA', 'CANCELADA'],
    CONFIRMADA: ['CHECK_IN', 'CANCELADA'],
    CHECK_IN: ['EM_ATENDIMENTO', 'CANCELADA'],
    EM_ATENDIMENTO: ['REALIZADA', 'CANCELADA'],
    REALIZADA: [],
    CANCELADA: [],
  };

  podeTransicionarPara(novoStatus: StatusConsulta): boolean {
    return Consulta.TRANSICOES_PERMITIDAS[this.status]?.includes(novoStatus) ?? false;
  }

  isEstadoFinal(): boolean {
    return this.status === 'REALIZADA' || this.status === 'CANCELADA';
  }
}
