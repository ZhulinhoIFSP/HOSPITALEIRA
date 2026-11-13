import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Medico } from '../../../domain/entities/medico.entity';
import { IMedicoRepository } from '../../../domain/repositories/medico.repository.interface';

@Injectable()
export class PrismaMedicoRepository implements IMedicoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Medico[]> {
    const records = await this.prisma.medico.findMany({
      orderBy: { id: 'asc' },
    });
    return records.map(
      (r) => new Medico(r.id, r.nome, r.especialidade, r.crm ?? undefined, r.telefone ?? undefined),
    );
  }

  async findById(id: number): Promise<Medico | null> {
    const r = await this.prisma.medico.findUnique({ where: { id } });
    if (!r) return null;
    return new Medico(r.id, r.nome, r.especialidade, r.crm ?? undefined, r.telefone ?? undefined);
  }

  async create(dados: Omit<Medico, 'id'>): Promise<Medico> {
    const r = await this.prisma.medico.create({
      data: {
        nome: dados.nome,
        especialidade: dados.especialidade,
        crm: dados.crm,
        telefone: dados.telefone,
      },
    });
    return new Medico(r.id, r.nome, r.especialidade, r.crm ?? undefined, r.telefone ?? undefined);
  }

  async update(id: number, dados: Partial<Omit<Medico, 'id'>>): Promise<Medico | null> {
    try {
      const r = await this.prisma.medico.update({
        where: { id },
        data: {
          nome: dados.nome,
          especialidade: dados.especialidade,
          crm: dados.crm,
          telefone: dados.telefone,
        },
      });
      return new Medico(r.id, r.nome, r.especialidade, r.crm ?? undefined, r.telefone ?? undefined);
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.medico.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
