'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { ConsultaStatusBadge } from '@/components/consultas/consulta-status-badge';
import { useConsultas } from '@/components/consultas/consulta-provider';
import { Modal } from '@/components/ui/modal';
import { StatusConsulta } from '@/types/consulta';

const proximaAcao: Partial<Record<StatusConsulta, { texto: string; status: StatusConsulta }>> = {
  AGENDADA: { texto: 'Confirmar pelo paciente', status: 'CONFIRMADA' },
  CONFIRMADA: { texto: 'Fazer check-in', status: 'CHECK_IN' },
  CHECK_IN: { texto: 'Iniciar atendimento médico', status: 'EM_ATENDIMENTO' },
  EM_ATENDIMENTO: { texto: 'Marcar como realizada (Médico)', status: 'REALIZADA' },
};

export default function DetalheConsulta() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const {
    consultas,
    pacientes,
    medicos,
    loading,
    alterarStatus,
    editarConsulta,
    excluirConsulta,
  } = useConsultas();

  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

  if (loading) {
    return <p className="text-slate-600">Carregando consultas...</p>;
  }

  const consulta = consultas.find((item) => item.id === id);

  if (!consulta) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-2xl font-bold text-slate-800">Consulta #{id} não encontrada</h1>
        <p className="mt-2 text-slate-600">O registro solicitado não existe ou foi removido.</p>
        <Link
          href="/consultas"
          className="mt-4 inline-block rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800"
        >
          Voltar para consultas
        </Link>
      </div>
    );
  }

  const consultaAtual = consulta;
  const paciente = pacientes.find((item) => item.id === consultaAtual.pacienteId);
  const medico = medicos.find((item) => item.id === consultaAtual.medicoId);
  const acao = proximaAcao[consultaAtual.status];

  async function mudarStatus(status: StatusConsulta) {
    setErro('');
    setSalvando(true);
    try {
      await alterarStatus(consultaAtual.id, status);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível atualizar o status.');
    } finally {
      setSalvando(false);
    }
  }

  async function submeterEdicao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const dados = new FormData(event.currentTarget);
    setSalvando(true);
    setErro('');

    try {
      await editarConsulta(consultaAtual.id, {
        pacienteId: Number(dados.get('pacienteId')),
        medicoId: Number(dados.get('medicoId')),
        data: String(dados.get('data')),
        horario: String(dados.get('horario')),
      });
      setEditando(false);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível editar a consulta.');
    } finally {
      setSalvando(false);
    }
  }

  async function executarExclusao() {
    setSalvando(true);
    setErro('');
    try {
      await excluirConsulta(consultaAtual.id);
      router.push('/consultas');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível excluir a consulta.');
      setModalExcluirAberto(false);
    } finally {
      setSalvando(false);
    }
  }

  async function cancelarConsulta() {
    if (window.confirm('Tem certeza que deseja cancelar esta consulta?')) {
      await mudarStatus('CANCELADA');
    }
  }

  return (
    <>
      <Link
        href="/consultas"
        className="text-sm font-semibold text-teal-700 hover:underline"
      >
        ← Voltar para consultas
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Consulta #{consultaAtual.id}</h1>
          <p className="mt-1 text-slate-600">Detalhes, alteração e fluxo de status.</p>
        </div>
        <ConsultaStatusBadge status={consultaAtual.status} />
      </div>

      {erro && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          {erro}
        </div>
      )}

      {/* Cartão de Detalhes */}
      <section className="mt-6 max-w-3xl rounded-xl bg-white p-6 shadow-sm">
        <dl className="grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-slate-500">Paciente</dt>
            <dd className="mt-1 text-base font-semibold text-slate-900">
              {paciente?.nome ?? `ID ${consultaAtual.pacienteId}`}
            </dd>
            {paciente?.telefone && (
              <dd className="text-xs text-slate-500">{paciente.telefone}</dd>
            )}
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Médico</dt>
            <dd className="mt-1 text-base font-semibold text-slate-900">
              {medico?.nome ?? `ID ${consultaAtual.medicoId}`}
            </dd>
            <dd className="text-xs text-slate-500">{medico?.especialidade ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Data e Horário</dt>
            <dd className="mt-1 text-base font-semibold text-slate-900">
              {consultaAtual.data} às {consultaAtual.horario}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Status Atual</dt>
            <dd className="mt-1 font-semibold text-slate-800">{consultaAtual.status}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Criada em</dt>
            <dd className="mt-1 text-sm text-slate-700">
              {new Date(consultaAtual.createdAt).toLocaleString('pt-BR')}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Última atualização</dt>
            <dd className="mt-1 text-sm text-slate-700">
              {new Date(consultaAtual.updatedAt).toLocaleString('pt-BR')}
            </dd>
          </div>
        </dl>

        {/* Botões de Ação do Fluxo e CRUD */}
        <div className="mt-8 flex flex-wrap items-center gap-3 border-t pt-5">
          {acao && (
            <button
              type="button"
              disabled={salvando}
              onClick={() => mudarStatus(acao.status)}
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : acao.texto}
            </button>
          )}

          {(consultaAtual.status === 'AGENDADA' || consultaAtual.status === 'CONFIRMADA') && (
            <>
              <button
                type="button"
                disabled={salvando}
                onClick={() => setEditando(!editando)}
                className="rounded-lg border border-teal-600 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50 disabled:opacity-50"
              >
                {editando ? 'Fechar Edição' : 'Alterar Consulta'}
              </button>
              <button
                type="button"
                disabled={salvando}
                onClick={cancelarConsulta}
                className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-50"
              >
                Cancelar Consulta
              </button>
            </>
          )}

          <button
            type="button"
            disabled={salvando}
            onClick={() => setModalExcluirAberto(true)}
            className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
          >
            Excluir Consulta
          </button>
        </div>

        {/* Formulário de Alteração Inline */}
        {editando && (
          <form
            onSubmit={submeterEdicao}
            className="mt-6 rounded-xl border border-teal-100 bg-teal-50/40 p-5 shadow-xs"
          >
            <h3 className="text-base font-bold text-slate-800 mb-4">
              Formulário de Alteração de Consulta
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Paciente</label>
                <select
                  name="pacienteId"
                  defaultValue={consultaAtual.pacienteId}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm focus:border-teal-500 focus:outline-none"
                >
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Médico</label>
                <select
                  name="medicoId"
                  defaultValue={consultaAtual.medicoId}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm focus:border-teal-500 focus:outline-none"
                >
                  {medicos.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome} — {m.especialidade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Data</label>
                <input
                  name="data"
                  type="date"
                  defaultValue={consultaAtual.data}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Horário</label>
                <input
                  name="horario"
                  type="time"
                  defaultValue={consultaAtual.horario}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditando(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
              >
                {salvando ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        aberto={modalExcluirAberto}
        aoFechar={() => setModalExcluirAberto(false)}
        titulo="Confirmar Exclusão"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Tem certeza de que deseja excluir permanentemente a Consulta #{consultaAtual.id}?
          </p>
          <div className="flex justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={() => setModalExcluirAberto(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={executarExclusao}
              disabled={salvando}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
            >
              {salvando ? 'Excluindo...' : 'Sim, Excluir'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
