import { Consulta } from '../entities/consulta.entity';

export type SlaAcaoGatilho = 'EXPIRAR' | 'ESCALONAR' | 'NENHUMA';

export interface SlaAvaliacaoResult {
  violou: boolean;
  acao: SlaAcaoGatilho;
  descricao?: string;
  minutosDecorridos?: number;
  minutosLimite?: number;
}

/**
 * Interface de Política de SLA (Temporalidade).
 * Princípio Aberto/Fechado (OCP) e Substituição de Liskov (LSP):
 * Novas políticas de SLA (ex: SLA de emissão de receita ou liberação de leito)
 * podem ser adicionadas sem alterar o motor de verificação de SLAs.
 */
export interface ISlaPolicy {
  readonly nome: string;
  avaliar(consulta: Consulta, agora: Date): SlaAvaliacaoResult;
  aplicar(consulta: Consulta, resultado: SlaAvaliacaoResult): Partial<Consulta>;
}
