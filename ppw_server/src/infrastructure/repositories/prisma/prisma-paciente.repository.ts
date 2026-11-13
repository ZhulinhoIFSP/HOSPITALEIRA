import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Paciente } from '../../../domain/entities/paciente.entity';
import { IPacienteRepository } from '../../../domain/repositories/paciente.repository.interface';

@Injectable()
export class PrismaPacienteRepository implements IPacienteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Paciente[]> {
    const records = await this.prisma.paciente.findMany({
      orderBy: { id: 'asc' },
    });
    return records.map(
      (r) => new Paciente(r.id, r.nome, r.email ?? undefined, r.telefone ?? undefined, r.cpf ?? undefined),
    );
  }

  async findById(id: number): Promise<Paciente | null> {
    const r = await this.prisma.paciente.findUnique({ where: { id } });
    if (!r) return null;
    return new Paciente(r.id, r.nome, r.email ?? undefined, r.telefone ?? undefined, r.cpf ?? undefined);
  }

  async create(dados: Omit<Paciente, 'id'>): Promise<Paciente> {
    const r = await this.prisma.paciente.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        telefone: dados.telefone,
        cpf: dados.cpf,
      },
    });
    return new Paciente(r.id, r.nome, r.email ?? undefined, r.telefone ?? undefined, r.cpf ?? undefined);
  }

  async update(id: number, dados: Partial<Omit<Paciente, 'id'>>): Promise<Paciente | null> {
    try {
      const r = await this.prisma.paciente.update({
        where: { id },
        data: {
          nome: dados.nome,
          email: dados.email,
          telefone: dados.telefone,
          cpf: dados.cpf,
        },
      });
      return new Paciente(r.id, r.nome, r.email ?? undefined, r.telefone ?? undefined, r.cpf ?? undefined);
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.paciente.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
