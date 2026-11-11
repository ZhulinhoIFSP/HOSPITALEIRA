import { Consulta } from '../entities/consulta.entity';
import { UserRole } from '../enums/user-role.enum';

export interface TransitionPayload {
  justificativa?: string;
  prontuario?: string;
  diagnostico?: string;
  prescricao?: string;
}

export interface TransitionContext {
  consulta: Consulta;
  actorId: number;
  actorRole: UserRole;
  payload?: TransitionPayload;
}
