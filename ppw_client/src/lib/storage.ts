import { Consulta } from '@/types/consulta';
const CHAVE_CONSULTAS = 'agenda-clinica-consultas';
export function carregarConsultas(): Consulta[] | null { if (typeof window === 'undefined') return null; const valor = window.localStorage.getItem(CHAVE_CONSULTAS); if (!valor) return null; try { return JSON.parse(valor) as Consulta[]; } catch { return null; } }
export function salvarConsultas(consultas: Consulta[]) { if (typeof window !== 'undefined') window.localStorage.setItem(CHAVE_CONSULTAS, JSON.stringify(consultas)); }
