import { IsIn, IsInt, IsOptional, Matches } from 'class-validator';
import { StatusConsulta } from '../consulta.interface';
export class UpdateConsultaDto { @IsOptional() @IsInt() pacienteId?: number; @IsOptional() @IsInt() medicoId?: number; @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) data?: string; @IsOptional() @Matches(/^\d{2}:\d{2}$/) horario?: string; @IsOptional() @IsIn(['AGENDADA', 'CONFIRMADA', 'CHECK_IN', 'REALIZADA', 'CANCELADA']) status?: StatusConsulta; }
