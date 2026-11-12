import { IsIn, IsInt, IsOptional, Matches } from 'class-validator';
import { StatusConsulta } from '../../domain/entities/consulta.entity';

export class UpdateConsultaDto {
  @IsOptional()
  @IsInt({ message: 'O ID do paciente deve ser um número inteiro.' })
  pacienteId?: number;

  @IsOptional()
  @IsInt({ message: 'O ID do médico deve ser um número inteiro.' })
  medicoId?: number;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'A data deve estar no formato AAAA-MM-DD.' })
  data?: string;

  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: 'O horário deve estar no formato HH:MM.' })
  horario?: string;

  @IsOptional()
  @IsIn(['AGENDADA', 'CONFIRMADA', 'CHECK_IN', 'EM_ATENDIMENTO', 'REALIZADA', 'CANCELADA'], {
    message: 'Status inválido.',
  })
  status?: StatusConsulta;

  @IsOptional()
  @IsInt({ message: 'A versão para controle de concorrência deve ser um número inteiro.' })
  version?: number;
}
