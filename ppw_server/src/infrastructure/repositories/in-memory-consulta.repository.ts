import { Injectable } from '@nestjs/common';
import { Consulta } from '../../domain/entities/consulta.entity';
import {
  CreateConsultaData,
  IConsultaRepository,
} from '../../domain/repositories/consulta.repository.interface';

@Injectable()
export class InMemoryConsultaRepository implements IConsultaRepository {
  private consultas: Consulta[] = [
    new Consulta(
      1,
      1,
      1,
      '2026-09-20',
      '08:00',
      'AGENDADA',
      '2026-09-01T10:00:00.000Z',
      '2026-09-01T10:00:00.000Z',
    ),
    new Consulta(
      2,
      2,
      2,
      '2026-09-20',
      '09:00',
      'CONFIRMADA',
      '2026-09-01T10:00:00.000Z',
      '2026-09-01T10:00:00.000Z',
    ),
    new Consulta(
      3,
      3,
      3,
      '2026-09-21',
      '10:00',
      'CHECK_IN',
      '2026-09-01T10:00:00.000Z',
      '2026-09-01T10:00:00.000Z',
    ),
    new Consulta(
      4,
      4,
      4,
      '2026-09-21',
      '14:00',
      'REALIZADA',
      '2026-09-01T10:00:00.000Z',
      '2026-09-01T10:00:00.000Z',
      'Paciente compareceu para revisão anual.',
      'Hipertensão estágio 1 controlada.',
      'Losartana 50mg 1x ao dia.',
    ),
    new Consulta(
      5,
      1,
      2,
      '2026-09-22',
      '15:00',
      'CANCELADA',
      '2026-09-01T10:00:00.000Z',
      '2026-09-01T10:00:00.000Z',
      undefined,
      undefined,
      undefined,
      'Paciente solicitou cancelamento por motivo de viagem.',
    ),
    new Consulta(
      6,
      2,
      1,
      '2026-09-23',
      '11:00',
      'AGENDADA',
      '2026-09-01T10:00:00.000Z',
      '2026-09-01T10:00:00.000Z',
    ),
  ];

  async findAll(): Promise<Consulta[]> {
    return [...this.consultas];
  }

  async findById(id: number): Promise<Consulta | null> {
    const consulta = this.consultas.find((c) => c.id === id);
    return consulta
      ? new Consulta(
          consulta.id,
          consulta.pacienteId,
          consulta.medicoId,
          consulta.data,
          consulta.horario,
          consulta.status,
          consulta.createdAt,
          consulta.updatedAt,
          consulta.prontuario,
          consulta.diagnostico,
          consulta.prescricao,
          consulta.motivoCancelamento,
          consulta.version ?? 1,
        )
      : null;
  }

  async findByMedicoEHorario(
    medicoId: number,
    data: string,
    horario: string,
    ignorarId?: number,
  ): Promise<Consulta | null> {
    const consulta = this.consultas.find(
      (c) =>
        c.id !== ignorarId &&
        c.medicoId === medicoId &&
        c.data === data &&
        c.horario === horario &&
        c.status !== 'CANCELADA',
    );
    return consulta ?? null;
  }

  async findByPacienteId(pacienteId: number): Promise<Consulta[]> {
    return this.consultas.filter((c) => c.pacienteId === pacienteId);
  }

  async findByMedicoId(medicoId: number): Promise<Consulta[]> {
    return this.consultas.filter((c) => c.medicoId === medicoId);
  }

  async create(dados: CreateConsultaData): Promise<Consulta> {
    const proximoId = this.consultas.reduce((max, c) => Math.max(max, c.id), 0) + 1;
    const agora = new Date().toISOString();
    const nova = new Consulta(
      proximoId,
      dados.pacienteId,
      dados.medicoId,
      dados.data,
      dados.horario,
      dados.status ?? 'AGENDADA',
      agora,
      agora,
      undefined,
      undefined,
      undefined,
      undefined,
      1,
    );
    this.consultas.push(nova);
    return nova;
  }

  async update(id: number, dados: Partial<Consulta>): Promise<Consulta | null> {
    const index = this.consultas.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const atual = this.consultas[index];
    const atualizada = new Consulta(
      atual.id,
      dados.pacienteId ?? atual.pacienteId,
      dados.medicoId ?? atual.medicoId,
      dados.data ?? atual.data,
      dados.horario ?? atual.horario,
      dados.status ?? atual.status,
      atual.createdAt,
      dados.updatedAt ?? new Date().toISOString(),
      dados.prontuario !== undefined ? dados.prontuario : atual.prontuario,
      dados.diagnostico !== undefined ? dados.diagnostico : atual.diagnostico,
      dados.prescricao !== undefined ? dados.prescricao : atual.prescricao,
      dados.motivoCancelamento !== undefined ? dados.motivoCancelamento : atual.motivoCancelamento,
      dados.version !== undefined ? dados.version : (atual.version ?? 1),
    );

    this.consultas[index] = atualizada;
    return atualizada;
  }

  async delete(id: number): Promise<boolean> {
    const index = this.consultas.findIndex((c) => c.id === id);
    if (index === -1) return false;
    this.consultas.splice(index, 1);
    return true;
  }

  async sincronizar(consultas: Consulta[]): Promise<Consulta[]> {
    this.consultas = consultas.map(
      (c) =>
        new Consulta(
          c.id,
          c.pacienteId,
          c.medicoId,
          c.data,
          c.horario,
          c.status,
          c.createdAt,
          c.updatedAt,
          c.prontuario,
          c.diagnostico,
          c.prescricao,
          c.motivoCancelamento,
          c.version ?? 1,
        ),
    );
    return [...this.consultas];
  }
}
