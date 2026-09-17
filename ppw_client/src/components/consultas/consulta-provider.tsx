'use client';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { buscarConsultas, buscarMedicos, buscarPacientes, criarConsulta as criarNaApi, atualizarConsulta as atualizarNaApi, sincronizarConsultas } from '@/lib/api';
import { carregarConsultas, salvarConsultas } from '@/lib/storage';
import { Consulta, DadosConsulta, Medico, Paciente, StatusConsulta } from '@/types/consulta';
type Contexto = { consultas: Consulta[]; pacientes: Paciente[]; medicos: Medico[]; loading: boolean; error: string; criarConsulta: (dados: DadosConsulta) => Promise<Consulta>; editarConsulta: (id: number, dados: DadosConsulta) => Promise<Consulta>; alterarStatus: (id: number, status: StatusConsulta) => Promise<Consulta>; };
const ConsultaContext = createContext<Contexto | null>(null);
export function ConsultaProvider({ children }: { children: ReactNode }) { const [consultas, setConsultas] = useState<Consulta[]>([]); const [pacientes, setPacientes] = useState<Paciente[]>([]); const [medicos, setMedicos] = useState<Medico[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  function atualizarLista(novas: Consulta[]) { setConsultas(novas); salvarConsultas(novas); }
  useEffect(() => { async function iniciar() { try { const [catalogoPacientes, catalogoMedicos] = await Promise.all([buscarPacientes(), buscarMedicos()]); setPacientes(catalogoPacientes); setMedicos(catalogoMedicos); const locais = carregarConsultas(); if (locais) { atualizarLista(locais); await sincronizarConsultas(locais); } else { atualizarLista(await buscarConsultas()); } } catch (erro) { setError(erro instanceof Error ? erro.message : 'Não foi possível carregar os dados.'); } finally { setLoading(false); } } void iniciar(); }, []);
  async function criarConsulta(dados: DadosConsulta) { const consulta = await criarNaApi(dados); atualizarLista([...consultas, consulta]); return consulta; }
  async function editarConsulta(id: number, dados: DadosConsulta) { const consulta = await atualizarNaApi(id, dados); atualizarLista(consultas.map((item) => item.id === id ? consulta : item)); return consulta; }
  async function alterarStatus(id: number, status: StatusConsulta) { const consulta = await atualizarNaApi(id, { status }); atualizarLista(consultas.map((item) => item.id === id ? consulta : item)); return consulta; }
  return <ConsultaContext.Provider value={{ consultas, pacientes, medicos, loading, error, criarConsulta, editarConsulta, alterarStatus }}>{children}</ConsultaContext.Provider>; }
export function useConsultas() { const contexto = useContext(ConsultaContext); if (!contexto) throw new Error('useConsultas deve ser usado dentro de ConsultaProvider.'); return contexto; }
