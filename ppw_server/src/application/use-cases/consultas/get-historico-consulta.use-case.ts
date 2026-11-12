import { Inject, Injectable } from '@nestjs/common';
import { HistoricoConsulta } from '../../../domain/entities/historico-consulta.entity';
import {
  HISTORICO_CONSULTA_REPOSITORY,
  IHistoricoConsultaRepository,
} from '../../../domain/repositories/historico-consulta.repository.interface';

/**
 * Caso de Uso: Obtenção da Trilha de Auditoria (Audit Log) da Consulta.
 * Retorna todos os registros históricos da entidade em ordem cronológica reversa.
 * Princípio da Responsabilidade Única (SRP).
 */
@Injectable()
export class GetHistoricoConsultaUseCase {
  constructor(
    @Inject(HISTORICO_CONSULTA_REPOSITORY)
    private readonly historicoRepository: IHistoricoConsultaRepository,
  ) {}

  async execute(consultaId: number): Promise<HistoricoConsulta[]> {
    return this.historicoRepository.findByConsultaId(consultaId);
  }

  async listAll(): Promise<HistoricoConsulta[]> {
    return this.historicoRepository.findAll();
  }
}
