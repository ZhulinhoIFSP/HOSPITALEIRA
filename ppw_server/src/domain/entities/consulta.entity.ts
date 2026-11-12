export type StatusConsulta =
  | 'AGENDADA'
  | 'CONFIRMADA'
  | 'CHECK_IN'
  | 'EM_ATENDIMENTO'
  | 'REALIZADA'
  | 'CANCELADA';

export type PrioridadeConsulta = 'NORMAL' | 'ALTA' | 'URGENTE';

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
<<<<<<< HEAD
    public salaId?: number,
    public dataCheckIn?: string,
    public limiteConfirmacaoAt?: string,
    public slaEstourado: boolean = false,
    public alertaEscalonamento?: string,
    public prioridade: PrioridadeConsulta = 'NORMAL',
    public compensacoesExecutadas?: string[],
=======
>>>>>>> 4eaf2c7f60f6385bd2869ceb8c2bc137f6b9b9cf
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
