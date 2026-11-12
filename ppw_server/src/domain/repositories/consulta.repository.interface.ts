import { Consulta, PrioridadeConsulta, StatusConsulta } from '../entities/consulta.entity';

export const CONSULTA_REPOSITORY = 'CONSULTA_REPOSITORY';

export interface CreateConsultaData {
  pacienteId: number;
  medicoId: number;
  data: string;
  horario: string;
  status?: StatusConsulta;
  salaId?: number;
  limiteConfirmacaoAt?: string;
  prioridade?: PrioridadeConsulta;
}

export interface IConsultaRepository {
  findAll(): Promise<Consulta[]>;
  findById(id: number): Promise<Consulta | null>;
  findByMedicoEHorario(medicoId: number, data: string, horario: string, ignorarId?: number): Promise<Consulta | null>;
  findByPacienteId(pacienteId: number): Promise<Consulta[]>;
  findByMedicoId(medicoId: number): Promise<Consulta[]>;
  create(dados: CreateConsultaData): Promise<Consulta>;
  update(id: number, dados: Partial<Consulta>): Promise<Consulta | null>;
  delete(id: number): Promise<boolean>;
  sincronizar(consultas: Consulta[]): Promise<Consulta[]>;
}
