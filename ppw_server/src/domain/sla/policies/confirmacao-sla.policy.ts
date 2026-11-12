import { Consulta } from '../../entities/consulta.entity';
import { ISlaPolicy, SlaAvaliacaoResult } from '../sla-policy.interface';

/**
 * Política de SLA de Confirmação Prévia.
 * Se uma consulta permanece como 'AGENDADA' e ultrapassa o limite de confirmação,
 * o gatilho expira a consulta automaticamente liberando a vaga.
 * Princípio da Responsabilidade Única (SRP).
 */
export class ConfirmacaoSlaPolicy implements ISlaPolicy {
  readonly nome = 'ConfirmacaoSlaPolicy';

  avaliar(consulta: Consulta, agora: Date): SlaAvaliacaoResult {
    if (consulta.status !== 'AGENDADA') {
      return { violou: false, acao: 'NENHUMA' };
    }

    if (!consulta.limiteConfirmacaoAt) {
      // Se não houver limite explícito, assume como prazo a própria data/horário da consulta
      const dataHoraConsulta = new Date(`${consulta.data}T${consulta.horario}:00`);
      if (agora >= dataHoraConsulta) {
        return {
          violou: true,
          acao: 'EXPIRAR',
          descricao: 'Consulta não confirmada até o horário agendado.',
        };
      }
      return { violou: false, acao: 'NENHUMA' };
    }

    const limite = new Date(consulta.limiteConfirmacaoAt);
    if (agora >= limite) {
      return {
        violou: true,
        acao: 'EXPIRAR',
        descricao: `Prazo limite de confirmação expirado em ${limite.toISOString()}.`,
      };
    }

    return { violou: false, acao: 'NENHUMA' };
  }

  aplicar(consulta: Consulta, resultado: SlaAvaliacaoResult): Partial<Consulta> {
    if (!resultado.violou || resultado.acao !== 'EXPIRAR') {
      return {};
    }

    return {
      status: 'CANCELADA',
      motivoCancelamento: 'Cancelamento automático: prazo de confirmação expirado (SLA).',
      updatedAt: new Date().toISOString(),
    };
  }
}
