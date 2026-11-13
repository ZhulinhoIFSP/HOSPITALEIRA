import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Consulta, PrioridadeConsulta, StatusConsulta } from '../../../domain/entities/consulta.entity';
import { CreateConsultaData, IConsultaRepository } from '../../../domain/repositories/consulta.repository.interface';

@Injectable()
export class PrismaConsultaRepository implements IConsultaRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(r: any): Consulta {
    return new Consulta(
      r.id,
      r.pacienteId,
      r.medicoId,
      r.data,
      r.horario,
      r.status as StatusConsulta,
      r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
      r.updatedAt instanceof Date ? r.updatedAt.toISOString() : String(r.updatedAt),
      r.prontuario ?? undefined,
      r.diagnostico ?? undefined,
      r.prescricao ?? undefined,
      r.motivoCancelamento ?? undefined,
      r.version ?? 1,
      r.salaId ?? undefined,
      r.dataCheckIn ? (r.dataCheckIn instanceof Date ? r.dataCheckIn.toISOString() : String(r.dataCheckIn)) : undefined,
      r.limiteConfirmacaoAt ? (r.limiteConfirmacaoAt instanceof Date ? r.limiteConfirmacaoAt.toISOString() : String(r.limiteConfirmacaoAt)) : undefined,
      r.slaEstourado ?? false,
      r.alertaEscalonamento ?? undefined,
      (r.prioridade as PrioridadeConsulta) ?? 'NORMAL',
      r.compensacoesExecutadas ?? [],
    );
  }

  async findAll(): Promise<Consulta[]> {
    const list = await this.prisma.consulta.findMany({
      orderBy: { id: 'desc' },
    });
    return list.map((r) => this.toEntity(r));
  }

  async findById(id: number): Promise<Consulta | null> {
    const r = await this.prisma.consulta.findUnique({ where: { id } });
    if (!r) return null;
    return this.toEntity(r);
  }

  async findByMedicoEHorario(
    medicoId: number,
    data: string,
    horario: string,
    ignorarId?: number,
  ): Promise<Consulta | null> {
    const r = await this.prisma.consulta.findFirst({
      where: {
        medicoId,
        data,
        horario,
        status: { not: 'CANCELADA' },
        ...(ignorarId ? { id: { not: ignorarId } } : {}),
      },
    });
    if (!r) return null;
    return this.toEntity(r);
  }

  async findByPacienteId(pacienteId: number): Promise<Consulta[]> {
    const list = await this.prisma.consulta.findMany({
      where: { pacienteId },
      orderBy: { id: 'desc' },
    });
    return list.map((r) => this.toEntity(r));
  }

  async findByMedicoId(medicoId: number): Promise<Consulta[]> {
    const list = await this.prisma.consulta.findMany({
      where: { medicoId },
      orderBy: { id: 'desc' },
    });
    return list.map((r) => this.toEntity(r));
  }

  async create(dados: CreateConsultaData): Promise<Consulta> {
    const r = await this.prisma.consulta.create({
      data: {
        pacienteId: dados.pacienteId,
        medicoId: dados.medicoId,
        data: dados.data,
        horario: dados.horario,
        status: (dados.status as any) ?? 'AGENDADA',
        salaId: dados.salaId,
        limiteConfirmacaoAt: dados.limiteConfirmacaoAt ? new Date(dados.limiteConfirmacaoAt) : undefined,
        prioridade: (dados.prioridade as any) ?? 'NORMAL',
        version: 1,
      },
    });
    return this.toEntity(r);
  }

  async update(id: number, dados: Partial<Consulta>): Promise<Consulta | null> {
    try {
      const dataToUpdate: any = {};
      if (dados.pacienteId !== undefined) dataToUpdate.pacienteId = dados.pacienteId;
      if (dados.medicoId !== undefined) dataToUpdate.medicoId = dados.medicoId;
      if (dados.data !== undefined) dataToUpdate.data = dados.data;
      if (dados.horario !== undefined) dataToUpdate.horario = dados.horario;
      if (dados.status !== undefined) dataToUpdate.status = dados.status;
      if (dados.prontuario !== undefined) dataToUpdate.prontuario = dados.prontuario;
      if (dados.diagnostico !== undefined) dataToUpdate.diagnostico = dados.diagnostico;
      if (dados.prescricao !== undefined) dataToUpdate.prescricao = dados.prescricao;
      if (dados.motivoCancelamento !== undefined) dataToUpdate.motivoCancelamento = dados.motivoCancelamento;
      if (dados.version !== undefined) dataToUpdate.version = dados.version;
      if (dados.salaId !== undefined) dataToUpdate.salaId = dados.salaId;
      if (dados.dataCheckIn !== undefined) {
        dataToUpdate.dataCheckIn = dados.dataCheckIn ? new Date(dados.dataCheckIn) : null;
      }
      if (dados.limiteConfirmacaoAt !== undefined) {
        dataToUpdate.limiteConfirmacaoAt = dados.limiteConfirmacaoAt ? new Date(dados.limiteConfirmacaoAt) : null;
      }
      if (dados.slaEstourado !== undefined) dataToUpdate.slaEstourado = dados.slaEstourado;
      if (dados.alertaEscalonamento !== undefined) dataToUpdate.alertaEscalonamento = dados.alertaEscalonamento;
      if (dados.prioridade !== undefined) dataToUpdate.prioridade = dados.prioridade;
      if (dados.compensacoesExecutadas !== undefined) dataToUpdate.compensacoesExecutadas = dados.compensacoesExecutadas;

      const r = await this.prisma.consulta.update({
        where: { id },
        data: dataToUpdate,
      });
      return this.toEntity(r);
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.consulta.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async sincronizar(consultas: Consulta[]): Promise<Consulta[]> {
    return consultas;
  }
}
