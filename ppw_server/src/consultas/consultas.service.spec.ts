import { Test } from '@nestjs/testing';
import { MedicosModule } from '../medicos/medicos.module';
import { PacientesModule } from '../pacientes/pacientes.module';
import { ConsultasService } from './consultas.service';

describe('ConsultasService', () => {
  let service: ConsultasService;
  beforeEach(async () => { const module = await Test.createTestingModule({ imports: [PacientesModule, MedicosModule], providers: [ConsultasService] }).compile(); service = module.get(ConsultasService); });
  it('cria uma consulta agendada', () => expect(service.create({ pacienteId: 1, medicoId: 4, data: '2026-10-01', horario: '09:00' }).status).toBe('AGENDADA'));
  it('rejeita horário ocupado para o mesmo médico', () => expect(() => service.create({ pacienteId: 3, medicoId: 1, data: '2026-09-20', horario: '08:00' })).toThrow('O médico já possui'));
  it('aceita uma transição válida', () => expect(service.update(1, { status: 'CONFIRMADA' }).status).toBe('CONFIRMADA'));
  it('rejeita uma transição inválida', () => expect(() => service.update(4, { status: 'CANCELADA' })).toThrow('Transição inválida'));
});
