/**
 * Entidade de Trilha de Auditoria (Audit Log) / Histórico de Consulta.
 *
 * Atende aos requisitos do Item 1.C:
 * - id: Identificador do registro de auditoria
 * - consultaId (id_registro): Identificador da entidade vinculada
 * - estadoAnterior: Estado antes da transição
 * - novoEstado: Novo estado após a transição
 * - autorId: Identificador do usuário/ator que realizou a ação
 * - autorRole: Perfil de acesso do autor (RBAC)
 * - justificativa: Motivo ou descrição da transição
 * - timestamp: Data/hora exata do evento (ISO 8601)
 * - versao: Versão do registro no momento da alteração
 * - detalhes: Informações complementares estruturadas
 */
export class HistoricoConsulta {
  constructor(
    public readonly id: number,
    public readonly consultaId: number,
    public readonly estadoAnterior: string,
    public readonly novoEstado: string,
    public readonly autorId: number,
    public readonly autorRole: string,
    public readonly justificativa: string,
    public readonly timestamp: string,
    public readonly versao: number,
    public readonly detalhes?: Record<string, unknown>,
  ) {}
}
