import { HistoricoConsulta } from '../entities/historico-consulta.entity';

export const HISTORICO_CONSULTA_REPOSITORY = 'HISTORICO_CONSULTA_REPOSITORY';

export interface CreateHistoricoData {
  consultaId: number;
  estadoAnterior: string;
  novoEstado: string;
  autorId: number;
  autorRole: string;
  justificativa: string;
  timestamp?: string;
  versao: number;
  detalhes?: Record<string, unknown>;
}

export interface IHistoricoConsultaRepository {
  create(dados: CreateHistoricoData): Promise<HistoricoConsulta>;
  findByConsultaId(consultaId: number): Promise<HistoricoConsulta[]>;
  findAll(): Promise<HistoricoConsulta[]>;
}
