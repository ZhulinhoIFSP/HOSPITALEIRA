import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ConsultaAcao, CONSULTA_ACOES } from '../../domain/enums/consulta-acao.enum';
import { UserRole, USER_ROLES } from '../../domain/enums/user-role.enum';

export class TransitionPayloadDto {
  @IsOptional()
  @IsString()
  justificativa?: string;

  @IsOptional()
  @IsString()
  prontuario?: string;

  @IsOptional()
  @IsString()
  diagnostico?: string;

  @IsOptional()
  @IsString()
  prescricao?: string;
}

export class ExecutarAcaoConsultaDto {
  @IsIn(CONSULTA_ACOES, {
    message: `Ação inválida. Ações permitidas: ${CONSULTA_ACOES.join(', ')}.`,
  })
  acao!: ConsultaAcao;

  @IsInt({ message: 'O actorId deve ser um número inteiro.' })
  actorId!: number;

  @IsIn(USER_ROLES, {
    message: `Perfil (actorRole) inválido. Perfis aceitos: ${USER_ROLES.join(', ')}.`,
  })
  actorRole!: UserRole;

  @IsOptional()
  @ValidateNested()
  @Type(() => TransitionPayloadDto)
  payload?: TransitionPayloadDto;

  @IsOptional()
  @IsInt({ message: 'A versão deve ser um número inteiro.' })
  version?: number;
}

export class BaseAcaoDto {
  @IsInt({ message: 'O actorId deve ser um número inteiro.' })
  actorId!: number;

  @IsIn(USER_ROLES, {
    message: `Perfil (actorRole) inválido. Perfis aceitos: ${USER_ROLES.join(', ')}.`,
  })
  actorRole!: UserRole;

  @IsOptional()
  @IsInt({ message: 'A versão deve ser um número inteiro.' })
  version?: number;
}

export class ConcluirAcaoDto extends BaseAcaoDto {
  @IsString()
  @IsNotEmpty({ message: 'O laudo/prontuário médico é obrigatório.' })
  prontuario!: string;

  @IsString()
  @IsNotEmpty({ message: 'O diagnóstico clínico é obrigatório.' })
  diagnostico!: string;

  @IsOptional()
  @IsString()
  prescricao?: string;
}

export class CancelarAcaoDto extends BaseAcaoDto {
  @IsString()
  @IsNotEmpty({ message: 'A justificativa do cancelamento é obrigatória.' })
  justificativa!: string;
}
