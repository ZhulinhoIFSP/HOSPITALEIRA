import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { MedicosService } from '../medicos/medicos.service';
import { PacientesService } from '../pacientes/pacientes.service';
import { Consulta, StatusConsulta } from './consulta.interface';
import { CreateConsultaDto } from './dto/create-consulta.dto';
import { UpdateConsultaDto } from './dto/update-consulta.dto';

@Injectable()
export class ConsultasService {
  private consultas: Consulta[] = [
    { id: 1, pacienteId: 1, medicoId: 1, data: '2026-09-20', horario: '08:00', status: 'AGENDADA', createdAt: '2026-09-01T10:00:00.000Z', updatedAt: '2026-09-01T10:00:00.000Z' },
    { id: 2, pacienteId: 2, medicoId: 2, data: '2026-09-20', horario: '09:00', status: 'CONFIRMADA', createdAt: '2026-09-01T10:00:00.000Z', updatedAt: '2026-09-01T10:00:00.000Z' },
    { id: 3, pacienteId: 3, medicoId: 3, data: '2026-09-21', horario: '10:00', status: 'CHECK_IN', createdAt: '2026-09-01T10:00:00.000Z', updatedAt: '2026-09-01T10:00:00.000Z' },
    { id: 4, pacienteId: 4, medicoId: 4, data: '2026-09-21', horario: '14:00', status: 'REALIZADA', createdAt: '2026-09-01T10:00:00.000Z', updatedAt: '2026-09-01T10:00:00.000Z' },
    { id: 5, pacienteId: 1, medicoId: 2, data: '2026-09-22', horario: '15:00', status: 'CANCELADA', createdAt: '2026-09-01T10:00:00.000Z', updatedAt: '2026-09-01T10:00:00.000Z' },
    { id: 6, pacienteId: 2, medicoId: 1, data: '2026-09-23', horario: '11:00', status: 'AGENDADA', createdAt: '2026-09-01T10:00:00.000Z', updatedAt: '2026-09-01T10:00:00.000Z' },
  ];

  constructor(private readonly pacientesService: PacientesService, private readonly medicosService: MedicosService) {}
  findAll() { return this.consultas; }
  findOne(id: number) { const consulta = this.consultas.find((item) => item.id === id); if (!consulta) throw new NotFoundException('Consulta não encontrada.'); return consulta; }
  create(dto: CreateConsultaDto) {
    this.pacientesService.findOne(dto.pacienteId); this.medicosService.findOne(dto.medicoId); this.validarConflito(dto.medicoId, dto.data, dto.horario);
    const agora = new Date().toISOString(); const consulta: Consulta = { id: this.proximoId(), ...dto, status: 'AGENDADA', createdAt: agora, updatedAt: agora };
    this.consultas.push(consulta); return consulta;
  }
  update(id: number, dto: UpdateConsultaDto) {
    const consulta = this.findOne(id); const pacienteId = dto.pacienteId ?? consulta.pacienteId; const medicoId = dto.medicoId ?? consulta.medicoId;
    const data = dto.data ?? consulta.data; const horario = dto.horario ?? consulta.horario;
    this.pacientesService.findOne(pacienteId); this.medicosService.findOne(medicoId);
    if (dto.status && dto.status !== consulta.status) this.validarTransicao(consulta.status, dto.status);
    this.validarConflito(medicoId, data, horario, id);
    Object.assign(consulta, { ...dto, pacienteId, medicoId, data, horario, updatedAt: new Date().toISOString() }); return consulta;
  }
  sincronizar(consultas: Consulta[]) {
    if (!Array.isArray(consultas) || !consultas.every((item) => this.consultaValida(item))) throw new BadRequestException('Lista de consultas inválida.');
    this.consultas = consultas.map((consulta) => ({ ...consulta })); return this.consultas;
  }
  private proximoId() { return this.consultas.reduce((maior, consulta) => Math.max(maior, consulta.id), 0) + 1; }
  private validarConflito(medicoId: number, data: string, horario: string, ignorarId?: number) {
    const conflito = this.consultas.some((consulta) => consulta.id !== ignorarId && consulta.medicoId === medicoId && consulta.data === data && consulta.horario === horario && consulta.status !== 'CANCELADA');
    if (conflito) throw new ConflictException('O médico já possui uma consulta agendada para esse horário.');
  }
  private validarTransicao(atual: StatusConsulta, proximo: StatusConsulta) {
    const permitidas: Record<StatusConsulta, StatusConsulta[]> = { AGENDADA: ['CONFIRMADA', 'CANCELADA'], CONFIRMADA: ['CHECK_IN', 'CANCELADA'], CHECK_IN: ['REALIZADA'], REALIZADA: [], CANCELADA: [] };
    if (!permitidas[atual].includes(proximo)) throw new BadRequestException(`Transição inválida: ${atual} para ${proximo}.`);
  }
  private consultaValida(consulta: Consulta) { return Number.isInteger(consulta.id) && Number.isInteger(consulta.pacienteId) && Number.isInteger(consulta.medicoId) && /^\d{4}-\d{2}-\d{2}$/.test(consulta.data) && /^\d{2}:\d{2}$/.test(consulta.horario) && ['AGENDADA', 'CONFIRMADA', 'CHECK_IN', 'REALIZADA', 'CANCELADA'].includes(consulta.status) && typeof consulta.createdAt === 'string' && typeof consulta.updatedAt === 'string'; }
}
