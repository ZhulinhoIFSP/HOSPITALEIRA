'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  atualizarConsulta as atualizarConsultaNaApi,
  atualizarMedico as atualizarMedicoNaApi,
  atualizarPaciente as atualizarPacienteNaApi,
  buscarConsultas,
  buscarMedicos,
  buscarPacientes,
  criarConsulta as criarConsultaNaApi,
  criarMedico as criarMedicoNaApi,
  criarPaciente as criarPacienteNaApi,
  excluirConsulta as excluirConsultaNaApi,
  excluirMedico as excluirMedicoNaApi,
  excluirPaciente as excluirPacienteNaApi,
  executarAcaoConsulta as executarAcaoConsultaNaApi,
  sincronizarConsultas,
} from '@/lib/api';
import { carregarConsultas, salvarConsultas } from '@/lib/storage';
import {
  Consulta,
  DadosConsulta,
  DadosMedico,
  DadosPaciente,
  Medico,
  Paciente,
  StatusConsulta,
} from '@/types/consulta';

type Contexto = {
  consultas: Consulta[];
  pacientes: Paciente[];
  medicos: Medico[];
  loading: boolean;
  error: string;
  recarregar: () => Promise<void>;
  // Consultas CRUD
  criarConsulta: (dados: DadosConsulta) => Promise<Consulta>;
  editarConsulta: (
    id: number,
    dados: Partial<DadosConsulta & { status?: StatusConsulta }>,
  ) => Promise<Consulta>;
  alterarStatus: (id: number, status: StatusConsulta) => Promise<Consulta>;
  excluirConsulta: (id: number) => Promise<void>;
  // Pacientes CRUD
  criarPaciente: (dados: DadosPaciente) => Promise<Paciente>;
  editarPaciente: (id: number, dados: Partial<DadosPaciente>) => Promise<Paciente>;
  excluirPaciente: (id: number) => Promise<void>;
  // Médicos CRUD
  criarMedico: (dados: DadosMedico) => Promise<Medico>;
  editarMedico: (id: number, dados: Partial<DadosMedico>) => Promise<Medico>;
  excluirMedico: (id: number) => Promise<void>;
};

const ConsultaContext = createContext<Contexto | null>(null);

export function ConsultaProvider({ children }: { children: ReactNode }) {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function atualizarConsultasLocalmente(novas: Consulta[]) {
    setConsultas(novas);
    salvarConsultas(novas);
  }

  const recarregar = useCallback(async () => {
    try {
      setError('');
      const [catalogoPacientes, catalogoMedicos, listaConsultas] = await Promise.all([
        buscarPacientes(),
        buscarMedicos(),
        buscarConsultas(),
      ]);
      setPacientes(catalogoPacientes);
      setMedicos(catalogoMedicos);
      atualizarConsultasLocalmente(listaConsultas);
    } catch (erro) {
      setError(erro instanceof Error ? erro.message : 'Não foi possível carregar os dados.');
    }
  }, []);

  useEffect(() => {
    async function iniciar() {
      try {
        const [catalogoPacientes, catalogoMedicos] = await Promise.all([
          buscarPacientes(),
          buscarMedicos(),
        ]);
        setPacientes(catalogoPacientes);
        setMedicos(catalogoMedicos);

        const locais = carregarConsultas();
        if (locais && locais.length > 0) {
          atualizarConsultasLocalmente(locais);
          try {
            await sincronizarConsultas(locais);
          } catch {
            // Se falhar sincronização com server, mantém locais
          }
        } else {
          atualizarConsultasLocalmente(await buscarConsultas());
        }
      } catch (erro) {
        setError(erro instanceof Error ? erro.message : 'Não foi possível carregar os dados.');
      } finally {
        setLoading(false);
      }
    }
    void iniciar();
  }, []);

  // Consultas
  async function criarConsulta(dados: DadosConsulta) {
    const consulta = await criarConsultaNaApi(dados);
    atualizarConsultasLocalmente([...consultas, consulta]);
    return consulta;
  }

  async function editarConsulta(
    id: number,
    dados: Partial<DadosConsulta & { status?: StatusConsulta }>,
  ) {
    const consulta = await atualizarConsultaNaApi(id, dados);
    atualizarConsultasLocalmente(
      consultas.map((item) => (item.id === id ? consulta : item)),
    );
    return consulta;
  }

  async function alterarStatus(id: number, status: StatusConsulta) {
    let acao: string;
    let actorRole = 'RECEPCIONISTA';
    let payload: Record<string, unknown> | undefined = undefined;

    if (status === 'CONFIRMADA') {
      acao = 'CONFIRMAR';
      actorRole = 'PACIENTE';
    } else if (status === 'CHECK_IN') {
      acao = 'CHECK_IN';
      actorRole = 'RECEPCIONISTA';
    } else if (status === 'EM_ATENDIMENTO') {
      acao = 'INICIAR_ATENDIMENTO';
      actorRole = 'MEDICO';
    } else if (status === 'REALIZADA') {
      acao = 'CONCLUIR';
      actorRole = 'MEDICO';
      payload = {
        prontuario: 'Atendimento clínico concluído pelo médico responsável.',
        diagnostico: 'Avaliação clínica geral realizada sem queixas agudas.',
      };
    } else if (status === 'CANCELADA') {
      acao = 'CANCELAR';
      actorRole = 'RECEPCIONISTA';
      payload = {
        justificativa: 'Cancelamento solicitado via interface do sistema.',
      };
    } else {
      throw new Error(`Ação não mapeada para o status ${status}`);
    }

    const consulta = await executarAcaoConsultaNaApi(id, {
      acao,
      actorId: 1,
      actorRole,
      payload,
    });
    atualizarConsultasLocalmente(
      consultas.map((item) => (item.id === id ? consulta : item)),
    );
    return consulta;
  }

  async function excluirConsulta(id: number) {
    await excluirConsultaNaApi(id);
    atualizarConsultasLocalmente(consultas.filter((item) => item.id !== id));
  }

  // Pacientes
  async function criarPaciente(dados: DadosPaciente) {
    const paciente = await criarPacienteNaApi(dados);
    setPacientes((anteriores) => [...anteriores, paciente]);
    return paciente;
  }

  async function editarPaciente(id: number, dados: Partial<DadosPaciente>) {
    const paciente = await atualizarPacienteNaApi(id, dados);
    setPacientes((anteriores) =>
      anteriores.map((item) => (item.id === id ? paciente : item)),
    );
    return paciente;
  }

  async function excluirPaciente(id: number) {
    await excluirPacienteNaApi(id);
    setPacientes((anteriores) => anteriores.filter((item) => item.id !== id));
  }

  // Médicos
  async function criarMedico(dados: DadosMedico) {
    const medico = await criarMedicoNaApi(dados);
    setMedicos((anteriores) => [...anteriores, medico]);
    return medico;
  }

  async function editarMedico(id: number, dados: Partial<DadosMedico>) {
    const medico = await atualizarMedicoNaApi(id, dados);
    setMedicos((anteriores) =>
      anteriores.map((item) => (item.id === id ? medico : item)),
    );
    return medico;
  }

  async function excluirMedico(id: number) {
    await excluirMedicoNaApi(id);
    setMedicos((anteriores) => anteriores.filter((item) => item.id !== id));
  }

  return (
    <ConsultaContext.Provider
      value={{
        consultas,
        pacientes,
        medicos,
        loading,
        error,
        recarregar,
        criarConsulta,
        editarConsulta,
        alterarStatus,
        excluirConsulta,
        criarPaciente,
        editarPaciente,
        excluirPaciente,
        criarMedico,
        editarMedico,
        excluirMedico,
      }}
    >
      {children}
    </ConsultaContext.Provider>
  );
}

export function useConsultas() {
  const contexto = useContext(ConsultaContext);
  if (!contexto) {
    throw new Error('useConsultas deve ser usado dentro de ConsultaProvider.');
  }
  return contexto;
}
