import { Injectable, NotFoundException } from '@nestjs/common';
import { Medico } from './medico.interface';
@Injectable()
export class MedicosService { private readonly medicos: Medico[] = [{ id: 1, nome: 'Ana Souza', especialidade: 'Clínica Geral' }, { id: 2, nome: 'Carlos Mendes', especialidade: 'Cardiologia' }, { id: 3, nome: 'João Oliveira', especialidade: 'Dermatologia' }, { id: 4, nome: 'Marina Santos', especialidade: 'Pediatria' }]; findAll() { return this.medicos; } findOne(id: number) { const medico = this.medicos.find((item) => item.id === id); if (!medico) throw new NotFoundException('Médico não encontrado.'); return medico; } }
