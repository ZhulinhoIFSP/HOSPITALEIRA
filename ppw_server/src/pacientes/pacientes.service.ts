import { Injectable, NotFoundException } from '@nestjs/common';
import { Paciente } from './paciente.interface';

@Injectable()
export class PacientesService {
  private readonly pacientes: Paciente[] = [
    { id: 1, nome: 'Maria Silva' }, { id: 2, nome: 'Pedro Almeida' },
    { id: 3, nome: 'Lara Costa' }, { id: 4, nome: 'Rafael Lima' },
  ];
  findAll() { return this.pacientes; }
  findOne(id: number) { const paciente = this.pacientes.find((item) => item.id === id); if (!paciente) throw new NotFoundException('Paciente não encontrado.'); return paciente; }
}
