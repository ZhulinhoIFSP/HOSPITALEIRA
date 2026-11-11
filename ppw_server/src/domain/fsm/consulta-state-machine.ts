import { BusinessRuleError } from '../../core/errors/domain.error';
import { Consulta, StatusConsulta } from '../entities/consulta.entity';
import { ConsultaAcao } from '../enums/consulta-acao.enum';
import { UserRole } from '../enums/user-role.enum';
import { JustificativaCancelamentoGuard } from './guards/justificativa-cancelamento.guard';
import { PacienteCancelamentoGuard } from './guards/paciente-cancelamento.guard';
import { ProntuarioObrigatorioGuard } from './guards/prontuario-obrigatorio.guard';
import { RbacGuard } from './guards/rbac.guard';
import { TransitionContext } from './transition-context';
import { ITransitionGuard } from './transition-guard.interface';

export interface TransitionRule {
  acao: ConsultaAcao;
  origens: StatusConsulta[];
  destino: StatusConsulta;
  allowedRoles: UserRole[];
  guards: ITransitionGuard[];
}

/**
 * Máquina de Estados Finita (FSM) de Consultas Hospitalares.
 *
 * Aplicação dos princípios SOLID:
 * - SRP: Responsável unicamente pela orquestração do ciclo de vida e transições de estado.
 * - OCP: Aberta para extensão com novas guardas e transições sem modificar o motor de execução.
 * - LSP: As guardas operam sob o contrato uniforme ITransitionGuard e são perfeitamente intercambiáveis.
 */
export class ConsultaStateMachine {
  private static readonly REGRAS: Record<ConsultaAcao, TransitionRule> = {
    CONFIRMAR: {
      acao: 'CONFIRMAR',
      origens: ['AGENDADA'],
      destino: 'CONFIRMADA',
      allowedRoles: ['PACIENTE', 'RECEPCIONISTA', 'ADMIN'],
      guards: [new RbacGuard(['PACIENTE', 'RECEPCIONISTA', 'ADMIN'])],
    },
    CHECK_IN: {
      acao: 'CHECK_IN',
      origens: ['CONFIRMADA'],
      destino: 'CHECK_IN',
      allowedRoles: ['RECEPCIONISTA', 'ADMIN'],
      guards: [new RbacGuard(['RECEPCIONISTA', 'ADMIN'])],
    },
    INICIAR_ATENDIMENTO: {
      acao: 'INICIAR_ATENDIMENTO',
      origens: ['CHECK_IN'],
      destino: 'EM_ATENDIMENTO',
      allowedRoles: ['MEDICO', 'ADMIN'],
      guards: [new RbacGuard(['MEDICO', 'ADMIN'])],
    },
    CONCLUIR: {
      acao: 'CONCLUIR',
      origens: ['EM_ATENDIMENTO'],
      destino: 'REALIZADA',
      allowedRoles: ['MEDICO', 'ADMIN'],
      guards: [
        new RbacGuard(['MEDICO', 'ADMIN']),
        new ProntuarioObrigatorioGuard(),
      ],
    },
    CANCELAR: {
      acao: 'CANCELAR',
      origens: ['AGENDADA', 'CONFIRMADA', 'CHECK_IN', 'EM_ATENDIMENTO'],
      destino: 'CANCELADA',
      allowedRoles: ['PACIENTE', 'RECEPCIONISTA', 'MEDICO', 'ADMIN'],
      guards: [
        new RbacGuard(['PACIENTE', 'RECEPCIONISTA', 'MEDICO', 'ADMIN']),
        new JustificativaCancelamentoGuard(),
        new PacienteCancelamentoGuard(),
      ],
    },
  };

  /**
   * Retorna a definição de regras da FSM para inspeção ou documentação.
   */
  static getRegras(): Record<ConsultaAcao, TransitionRule> {
    return { ...this.REGRAS };
  }

  /**
   * Retorna as ações disponíveis para uma consulta no seu estado atual e papel do usuário.
   */
  static getAcoesDisponiveis(status: StatusConsulta, role?: UserRole): ConsultaAcao[] {
    return (Object.keys(this.REGRAS) as ConsultaAcao[]).filter((acao) => {
      const regra = this.REGRAS[acao];
      const statusCompativel = regra.origens.includes(status);
      const roleCompativel = role ? regra.allowedRoles.includes(role) : true;
      return statusCompativel && roleCompativel;
    });
  }

  /**
   * Executa a transição de estado da consulta de forma segura e controlada.
   * Dispara a validação de todas as guardas registradas (RBAC, prontuário, justificativa, etc.).
   */
  static async transicionar(
    acao: ConsultaAcao,
    context: TransitionContext,
  ): Promise<{ novoStatus: StatusConsulta; dadosAtualizacao: Partial<Consulta> }> {
    const regra = this.REGRAS[acao];
    if (!regra) {
      throw new BusinessRuleError(`Ação desconhecida: '${acao}'.`);
    }

    const { consulta } = context;

    // 1. Validação de estado de origem
    if (!regra.origens.includes(consulta.status)) {
      throw new BusinessRuleError(
        `Transição inválida: Não é possível executar a ação '${acao}' a partir do estado '${consulta.status}'. Estados de origem permitidos: [${regra.origens.join(', ')}].`,
      );
    }

    // 2. Execução de todas as Transition Guards (SRP + LSP + OCP)
    for (const guard of regra.guards) {
      await guard.validate(acao, context);
    }

    // 3. Montagem dos dados atualizados de acordo com a ação realizada
    const agora = new Date().toISOString();
    const dadosAtualizacao: Partial<Consulta> = {
      status: regra.destino,
      updatedAt: agora,
    };

    if (acao === 'CONCLUIR') {
      dadosAtualizacao.prontuario = context.payload?.prontuario?.trim();
      dadosAtualizacao.diagnostico = context.payload?.diagnostico?.trim();
      if (context.payload?.prescricao) {
        dadosAtualizacao.prescricao = context.payload.prescricao.trim();
      }
    } else if (acao === 'CANCELAR') {
      dadosAtualizacao.motivoCancelamento = context.payload?.justificativa?.trim();
    }

    return {
      novoStatus: regra.destino,
      dadosAtualizacao,
    };
  }
}
