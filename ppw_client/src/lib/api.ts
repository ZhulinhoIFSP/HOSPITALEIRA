import { Consulta, DadosConsulta, Medico, Paciente } from '@/types/consulta';
const API_URL = 'http://localhost:8000';
async function requisicao<T>(caminho: string, opcoes?: RequestInit): Promise<T> { try { const resposta = await fetch(`${API_URL}${caminho}`, { headers: { 'Content-Type': 'application/json' }, ...opcoes }); if (!resposta.ok) { const erro = await resposta.json().catch(() => ({})); throw new Error(Array.isArray(erro.message) ? erro.message.join(', ') : erro.message || 'Não foi possível concluir a solicitação.'); } return resposta.json() as Promise<T>; } catch (erro) { if (erro instanceof TypeError) throw new Error('Backend indisponível. Verifique se a API está em execução na porta 8000.'); throw erro; } }
export const buscarConsultas = () => requisicao<Consulta[]>('/consultas');
export const buscarConsultaPorId = (id: number) => requisicao<Consulta>(`/consultas/${id}`);
export const criarConsulta = (dados: DadosConsulta) => requisicao<Consulta>('/consultas', { method: 'POST', body: JSON.stringify(dados) });
export const atualizarConsulta = (id: number, dados: Partial<DadosConsulta & Pick<Consulta, 'status'>>) => requisicao<Consulta>(`/consultas/${id}`, { method: 'PATCH', body: JSON.stringify(dados) });
export const sincronizarConsultas = (consultas: Consulta[]) => requisicao<Consulta[]>('/consultas/sincronizar', { method: 'PUT', body: JSON.stringify(consultas) });
export const buscarPacientes = () => requisicao<Paciente[]>('/pacientes'); export const buscarPacientePorId = (id: number) => requisicao<Paciente>(`/pacientes/${id}`);
export const buscarMedicos = () => requisicao<Medico[]>('/medicos'); export const buscarMedicoPorId = (id: number) => requisicao<Medico>(`/medicos/${id}`);
