import { Injectable } from '@nestjs/common';
import { HistoricoConsulta } from '../../domain/entities/historico-consulta.entity';
import {
  CreateHistoricoData,
  IHistoricoConsultaRepository,
} from '../../domain/repositories/historico-consulta.repository.interface';

@Injectable()
export class InMemoryHistoricoConsultaRepository
  implements IHistoricoConsultaRepository
{
  private historicos: HistoricoConsulta[] = [
    new HistoricoConsulta(
      1,
      1,
      'CRIADA',
      'AGENDADA',
      1,
      'RECEPCIONISTA',
      'Agendamento inicial criado no sistema.',
      '2026-09-01T10:00:00.000Z',
      1,
    ),
    new HistoricoConsulta(
      2,
      2,
      'AGENDADA',
      'CONFIRMADA',
      2,
      'PACIENTE',
      'Confirmação de presença pelo paciente.',
      '2026-09-01T10:00:00.000Z',
      1,
    ),
    new HistoricoConsulta(
      3,
      3,
      'CONFIRMADA',
      'CHECK_IN',
      99,
      'RECEPCIONISTA',
      'Paciente chegou à recepção.',
      '2026-09-01T10:00:00.000Z',
      1,
    ),
    new HistoricoConsulta(
      4,
      4,
      'EM_ATENDIMENTO',
      'REALIZADA',
      4,
      'MEDICO',
      'Consulta finalizada com laudo e diagnóstico.',
      '2026-09-01T10:00:00.000Z',
      1,
    ),
    new HistoricoConsulta(
      5,
      5,
      'AGENDADA',
      'CANCELADA',
      1,
      'RECEPCIONISTA',
      'Paciente solicitou cancelamento por motivo de viagem.',
      '2026-09-01T10:00:00.000Z',
      1,
    ),
  ];

  async create(dados: CreateHistoricoData): Promise<HistoricoConsulta> {
    const proximoId =
      this.historicos.reduce((max, h) => Math.max(max, h.id), 0) + 1;
    const timestamp = dados.timestamp ?? new Date().toISOString();

    const novo = new HistoricoConsulta(
      proximoId,
      dados.consultaId,
      dados.estadoAnterior,
      dados.novoEstado,
      dados.autorId,
      dados.autorRole,
      dados.justificativa,
      timestamp,
      dados.versao,
      dados.detalhes,
    );

    this.historicos.push(novo);
    return novo;
  }

  async findByConsultaId(consultaId: number): Promise<HistoricoConsulta[]> {
    return this.historicos
      .filter((h) => h.consultaId === consultaId)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  }

  async findAll(): Promise<HistoricoConsulta[]> {
    return [...this.historicos];
  }

  // Métodos de Snapshot para suporte à Transação ACID
  getSnapshot(): HistoricoConsulta[] {
    return [...this.historicos];
  }

  restoreSnapshot(snapshot: HistoricoConsulta[]): void {
    this.historicos = [...snapshot];
  }
}
