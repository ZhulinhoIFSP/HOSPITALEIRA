import { Injectable } from '@nestjs/common';
import { Consulta } from '../entities/consulta.entity';
import { ConfirmacaoSlaPolicy } from './policies/confirmacao-sla.policy';
import { TempoEsperaCheckInSlaPolicy } from './policies/tempo-espera-sla.policy';
import { ISlaPolicy, SlaAvaliacaoResult } from './sla-policy.interface';

export interface ProcessamentoSlaItemResult {
  consultaId: number;
  statusAnterior: string;
  novoStatus?: string;
  modificada: boolean;
  acoesDisparadas: string[];
}

/**
 * Orquestrador de SLAs e Temporalidade.
 * Aplica os princípios SOLID:
 * - SRP: Responsável unicamente pela orquestração e execução de políticas temporais.
 * - OCP: Aberto para novas políticas temporais via método `registrarPolitica()`.
 * - LSP: Todas as políticas cumprem o contrato ISlaPolicy de maneira transparente.
 */
@Injectable()
export class SlaManagerService {
  private readonly politicas: ISlaPolicy[] = [
    new ConfirmacaoSlaPolicy(),
    new TempoEsperaCheckInSlaPolicy(30),
  ];

  registrarPolitica(politica: ISlaPolicy): void {
    this.politicas.push(politica);
  }

  getPoliticas(): ISlaPolicy[] {
    return [...this.politicas];
  }

  avaliarConsulta(
    consulta: Consulta,
    agora: Date = new Date(),
  ): {
    modificada: boolean;
    dadosAtualizacao: Partial<Consulta>;
    resultados: SlaAvaliacaoResult[];
  } {
    let modificada = false;
    let dadosAtualizacao: Partial<Consulta> = {};
    const resultados: SlaAvaliacaoResult[] = [];

    for (const politica of this.politicas) {
      const res = politica.avaliar(consulta, agora);
      resultados.push(res);

      if (res.violou) {
        const patch = politica.aplicar(consulta, res);
        dadosAtualizacao = { ...dadosAtualizacao, ...patch };
        modificada = true;
      }
    }

    return { modificada, dadosAtualizacao, resultados };
  }
}
