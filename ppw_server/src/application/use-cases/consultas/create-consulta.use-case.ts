import { Inject, Injectable } from '@nestjs/common';
import { ConflictError, NotFoundError } from '../../../core/errors/domain.error';
import { AsyncLockService } from '../../../domain/concurrency/async-lock.service';
import { Consulta } from '../../../domain/entities/consulta.entity';
import { CONSULTA_REPOSITORY, IConsultaRepository } from '../../../domain/repositories/consulta.repository.interface';
import { IMedicoRepository, MEDICO_REPOSITORY } from '../../../domain/repositories/medico.repository.interface';
import { IPacienteRepository, PACIENTE_REPOSITORY } from '../../../domain/repositories/paciente.repository.interface';

export interface CreateConsultaInput {
  pacienteId: number;
  medicoId: number;
  data: string;
  horario: string;
  limiteConfirmacaoAt?: string;
  salaId?: number;
}

@Injectable()
export class CreateConsultaUseCase {
  constructor(
    @Inject(CONSULTA_REPOSITORY)
    private readonly consultaRepository: IConsultaRepository,
    @Inject(PACIENTE_REPOSITORY)
    private readonly pacienteRepository: IPacienteRepository,
    @Inject(MEDICO_REPOSITORY)
    private readonly medicoRepository: IMedicoRepository,
    private readonly asyncLockService: AsyncLockService,
  ) {}

  async execute(input: CreateConsultaInput): Promise<Consulta> {
    const paciente = await this.pacienteRepository.findById(input.pacienteId);
    if (!paciente) {
      throw new NotFoundError(`Paciente #${input.pacienteId} não encontrado.`);
    }

    const medico = await this.medicoRepository.findById(input.medicoId);
    if (!medico) {
      throw new NotFoundError(`Médico #${input.medicoId} não encontrado.`);
    }

    // LOCK ASSÍNCRONO: Proteção contra concorrência e agendamento simultâneo do mesmo médico/horário
    // Análogo ao projeto de Kayky (Coworking/Salas) ou Júlio César (Consultas)
    const lockKey = `medico:${input.medicoId}:${input.data}:${input.horario}`;

    return await this.asyncLockService.withLock(lockKey, async () => {
      const conflito = await this.consultaRepository.findByMedicoEHorario(
        input.medicoId,
        input.data,
        input.horario,
      );
      if (conflito) {
        throw new ConflictError('O médico já possui uma consulta agendada para esse horário.');
      }

      // Definição de prazo de SLA de confirmação prévia (padrão: 24 horas antes do horário da consulta)
      const dataHoraConsulta = new Date(`${input.data}T${input.horario}:00`);
      const limiteConfirmacaoCalculado = new Date(
        dataHoraConsulta.getTime() - 24 * 60 * 60 * 1000,
      ).toISOString();

      return await this.consultaRepository.create({
        pacienteId: input.pacienteId,
        medicoId: input.medicoId,
        data: input.data,
        horario: input.horario,
        status: 'AGENDADA',
        limiteConfirmacaoAt: input.limiteConfirmacaoAt ?? limiteConfirmacaoCalculado,
        salaId: input.salaId,
        prioridade: 'NORMAL',
      });
    });
  }
}
