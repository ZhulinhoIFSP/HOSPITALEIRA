import { Consulta } from '../../entities/consulta.entity';
import { ISlaPolicy, SlaAvaliacaoResult } from '../sla-policy.interface';

/**
 * Política de SLA de Tempo de Espera em Recepção / Escalonamento.
 * Monitora o tempo transcorrido desde o check-in presencial do paciente.
 * Se o tempo em sala de espera ultrapassar o limite (padrão: 30 min), aciona gatilho
 * de escalonamento para atendimento prioritário/urgente.
 * Princípio da Responsabilidade Única (SRP).
 */
export class TempoEsperaCheckInSlaPolicy implements ISlaPolicy {
  readonly nome = 'TempoEsperaCheckInSlaPolicy';

  constructor(private readonly limiteMinutos: number = 30) {}

  avaliar(consulta: Consulta, agora: Date): SlaAvaliacaoResult {
    if (consulta.status !== 'CHECK_IN') {
      return { violou: false, acao: 'NENHUMA' };
    }

    const marcoInicial = consulta.dataCheckIn
      ? new Date(consulta.dataCheckIn)
      : new Date(consulta.updatedAt);

    const diferencaMs = agora.getTime() - marcoInicial.getTime();
    const minutosDecorridos = Math.floor(diferencaMs / (1000 * 60));

    if (minutosDecorridos >= this.limiteMinutos) {
      return {
        violou: true,
        acao: 'ESCALONAR',
        minutosDecorridos,
        minutosLimite: this.limiteMinutos,
        descricao: `Paciente aguardando há ${minutosDecorridos} minutos na recepção (Limite SLA: ${this.limiteMinutos} min).`,
      };
    }

    return {
      violou: false,
      acao: 'NENHUMA',
      minutosDecorridos,
      minutosLimite: this.limiteMinutos,
    };
  }

  aplicar(consulta: Consulta, resultado: SlaAvaliacaoResult): Partial<Consulta> {
    if (!resultado.violou || resultado.acao !== 'ESCALONAR') {
      return {};
    }

    return {
      slaEstourado: true,
      alertaEscalonamento: resultado.descricao ?? 'ALERTA: TEMPO DE ESPERA EM SALA EXCEDIDO.',
      prioridade: 'URGENTE',
      updatedAt: new Date().toISOString(),
    };
  }
}
