import {
  Consulta,
  DadosConsulta,
  DadosMedico,
  DadosPaciente,
  Medico,
  Paciente,
} from '@/types/consulta';

const API_URL = 'http://localhost:8000';

async function requisicao<T>(caminho: string, opcoes?: RequestInit): Promise<T> {
  try {
    const resposta = await fetch(`${API_URL}${caminho}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opcoes,
    });
    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => ({}));
      const mensagem = Array.isArray(erro.message)
        ? erro.message.join(', ')
        : erro.message || 'Não foi possível concluir a solicitação.';
      throw new Error(mensagem);
    }
    return (await resposta.json()) as T;
  } catch (erro) {
    if (erro instanceof TypeError) {
      throw new Error(
        'Backend indisponível. Verifique se a API Nest está em execução na porta 8000.',
      );
    }
    throw erro;
  }
}

// Consultas
export const buscarConsultas = () => requisicao<Consulta[]>('/consultas');
export const buscarConsultaPorId = (id: number) => requisicao<Consulta>(`/consultas/${id}`);
export const criarConsulta = (dados: DadosConsulta) =>
  requisicao<Consulta>('/consultas', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
export const atualizarConsulta = (
  id: number,
  dados: Partial<DadosConsulta & Pick<Consulta, 'status'>>,
) =>
  requisicao<Consulta>(`/consultas/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dados),
  });
export const excluirConsulta = (id: number) =>
  requisicao<{ success: boolean; message: string }>(`/consultas/${id}`, {
    method: 'DELETE',
  });
export const executarAcaoConsulta = (
  id: number,
  dados: {
    acao: string;
    actorId: number;
    actorRole: string;
    payload?: Record<string, unknown>;
  },
) =>
  requisicao<Consulta>(`/consultas/${id}/acoes`, {
    method: 'POST',
    body: JSON.stringify(dados),
  });
export const sincronizarConsultas = (consultas: Consulta[]) =>
  requisicao<Consulta[]>('/consultas/sincronizar', {
    method: 'PUT',
    body: JSON.stringify(consultas),
  });

// Pacientes
export const buscarPacientes = () => requisicao<Paciente[]>('/pacientes');
export const buscarPacientePorId = (id: number) => requisicao<Paciente>(`/pacientes/${id}`);
export const criarPaciente = (dados: DadosPaciente) =>
  requisicao<Paciente>('/pacientes', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
export const atualizarPaciente = (id: number, dados: Partial<DadosPaciente>) =>
  requisicao<Paciente>(`/pacientes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dados),
  });
export const excluirPaciente = (id: number) =>
  requisicao<{ success: boolean; message: string }>(`/pacientes/${id}`, {
    method: 'DELETE',
  });

// Médicos
export const buscarMedicos = () => requisicao<Medico[]>('/medicos');
export const buscarMedicoPorId = (id: number) => requisicao<Medico>(`/medicos/${id}`);
export const criarMedico = (dados: DadosMedico) =>
  requisicao<Medico>('/medicos', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
export const atualizarMedico = (id: number, dados: Partial<DadosMedico>) =>
  requisicao<Medico>(`/medicos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dados),
  });
export const excluirMedico = (id: number) =>
  requisicao<{ success: boolean; message: string }>(`/medicos/${id}`, {
    method: 'DELETE',
  });
