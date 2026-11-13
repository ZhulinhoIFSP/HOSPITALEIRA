import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { HistoricoConsulta } from '../../../domain/entities/historico-consulta.entity';
import { CreateHistoricoData, IHistoricoConsultaRepository } from '../../../domain/repositories/historico-consulta.repository.interface';

@Injectable()
export class PrismaHistoricoConsultaRepository implements IHistoricoConsultaRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(r: any): HistoricoConsulta {
    return new HistoricoConsulta(
      r.id,
      r.consultaId,
      r.estadoAnterior,
      r.novoEstado,
      r.autorId,
      r.autorRole,
      r.justificativa,
      r.timestamp instanceof Date ? r.timestamp.toISOString() : String(r.timestamp),
      r.versao,
      r.detalhes ?? undefined,
    );
  }

  async create(dados: CreateHistoricoData): Promise<HistoricoConsulta> {
    const r = await this.prisma.historicoConsulta.create({
      data: {
        consultaId: dados.consultaId,
        estadoAnterior: dados.estadoAnterior,
        novoEstado: dados.novoEstado,
        autorId: dados.autorId,
        autorRole: dados.autorRole,
        justificativa: dados.justificativa,
        timestamp: dados.timestamp ? new Date(dados.timestamp) : new Date(),
        versao: dados.versao,
        detalhes: dados.detalhes as any,
      },
    });
    return this.toEntity(r);
  }

  async findByConsultaId(consultaId: number): Promise<HistoricoConsulta[]> {
    const list = await this.prisma.historicoConsulta.findMany({
      where: { consultaId },
      orderBy: { id: 'desc' },
    });
    return list.map((r) => this.toEntity(r));
  }

  async findAll(): Promise<HistoricoConsulta[]> {
    const list = await this.prisma.historicoConsulta.findMany({
      orderBy: { id: 'desc' },
    });
    return list.map((r) => this.toEntity(r));
  }
}
