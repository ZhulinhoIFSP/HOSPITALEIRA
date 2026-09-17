import { IsInt, IsNotEmpty, Matches } from 'class-validator';
export class CreateConsultaDto { @IsInt() pacienteId!: number; @IsInt() medicoId!: number; @IsNotEmpty() @Matches(/^\d{4}-\d{2}-\d{2}$/) data!: string; @IsNotEmpty() @Matches(/^\d{2}:\d{2}$/) horario!: string; }
