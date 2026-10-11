import { useEffect, useState, type FormEvent } from 'react';
import {
  atualizarBloco,
  criarBloco,
  listarMinhaAgenda,
  removerBloco,
  type BlocoAgenda,
} from '../api/agenda';
import { listarEspecialidades, type Especialidade } from '../api/catalog';

const DIAS = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];

const vazio = {
  especialidadeId: '',
  local: '',
  diaSemana: 1,
  horaInicio: '09:00',
  horaFim: '12:00',
  preco: 200,
};

export default function Agenda() {
  const [blocos, setBlocos] = useState<BlocoAgenda[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [form, setForm] = useState({ ...vazio });
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [removendoId, setRemovendoId] = useState<string | null>(null);

  async function carregar() {
    try {
      setBlocos(await listarMinhaAgenda());
    } catch {
      setErro('Nao foi possivel carregar a agenda (acesso do profissional).');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
    listarEspecialidades().then(setEspecialidades).catch(() => undefined);
  }, []);

  function editar(b: BlocoAgenda) {
    setEditandoId(b.id);
    setForm({
      especialidadeId: b.especialidadeId,
      local: b.local ?? '',
      diaSemana: b.diaSemana,
      horaInicio: b.horaInicio,
      horaFim: b.horaFim,
      preco: b.preco,
    });
    setMsg(null);
    setErro(null);
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm({ ...vazio });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setMsg(null);
    const input = {
      especialidadeId: form.especialidadeId,
      local: form.local || undefined,
      diaSemana: Number(form.diaSemana),
      horaInicio: form.horaInicio,
      horaFim: form.horaFim,
      preco: Number(form.preco),
    };
    try {
      if (editandoId) {
        await atualizarBloco(editandoId, input);
        setMsg('Bloco atualizado.');
      } else {
        await criarBloco(input);
        setMsg('Bloco adicionado.');
      }
      cancelarEdicao();
      await carregar();
    } catch {
      setErro('Nao foi possivel salvar. Verifique os dados (hora final > inicial).');
    }
  }

  async function remover(id: string) {
    setErro(null);
    setMsg(null);
    try {
      await removerBloco(id);
      if (editandoId === id) cancelarEdicao();
      await carregar();
      setMsg('Bloco removido da agenda.');
    } catch {
      setErro('Nao foi possivel remover o bloco.');
    } finally {
      setRemovendoId(null);
    }
  }

  return (
    <div>
      <section className="pb-6">
        <h1 className="text-2xl font-bold text-slate-900">Minha agenda</h1>
        <p className="mt-2 text-slate-500">
          Blocos de disponibilidade, precos e locais. Os horarios ficam disponiveis para agendamento.
        </p>
      </section>

      {msg && <p role="status" className="mb-4 text-sm text-green-700">{msg}</p>}
      {erro && <p role="alert" className="mb-4 text-sm text-red-700">{erro}</p>}

      <form onSubmit={onSubmit} className="card mb-6 flex flex-wrap items-end gap-3">
        <label className="field min-w-[180px] flex-1">
          Especialidade
          <select
            className="input"
            value={form.especialidadeId}
            onChange={(e) => setForm({ ...form, especialidadeId: e.target.value })}
            required
          >
            <option value="">Selecione</option>
            {especialidades.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="field min-w-[140px]">
          Local
          <input
            className="input"
            value={form.local}
            onChange={(e) => setForm({ ...form, local: e.target.value })}
            placeholder="Clinica Centro"
          />
        </label>
        <label className="field">
          Dia
          <select
            className="input"
            value={form.diaSemana}
            onChange={(e) => setForm({ ...form, diaSemana: Number(e.target.value) })}
          >
            {DIAS.map((d, i) => (
              <option key={i} value={i}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Inicio
          <input
            type="time"
            className="input"
            value={form.horaInicio}
            onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
            required
          />
        </label>
        <label className="field">
          Fim
          <input
            type="time"
            className="input"
            value={form.horaFim}
            onChange={(e) => setForm({ ...form, horaFim: e.target.value })}
            required
          />
        </label>
        <label className="field">
          Preco (R$)
          <input
            type="number"
            min={0}
            step="0.01"
            className="input w-28"
            value={form.preco}
            onChange={(e) => setForm({ ...form, preco: Number(e.target.value) })}
            required
          />
        </label>
        <button type="submit" className="btn btn-primary">
          {editandoId ? 'Salvar' : 'Adicionar'}
        </button>
        {editandoId && (
          <button type="button" className="btn btn-ghost" onClick={cancelarEdicao}>
            Cancelar
          </button>
        )}
      </form>

      <section className="card overflow-x-auto" aria-busy={loading}>
        {loading ? <p role="status" className="text-slate-500">Carregando agenda...</p> : <>
        {blocos.length === 0 ? (
          <p className="text-slate-500">Nenhum bloco cadastrado.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-2">Dia</th>
                <th className="py-2">Horario</th>
                <th className="py-2">Especialidade</th>
                <th className="py-2">Local</th>
                <th className="py-2 text-right">Preco</th>
                <th className="py-2 text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {blocos.map((b) => (
                <tr key={b.id} className="border-b border-slate-100">
                  <td className="py-2">{DIAS[b.diaSemana] ?? b.diaSemana}</td>
                  <td className="py-2">
                    {b.horaInicio} - {b.horaFim}
                  </td>
                  <td className="py-2">{b.especialidade ?? '-'}</td>
                  <td className="py-2">{b.local ?? '-'}</td>
                  <td className="py-2 text-right">R$ {b.preco.toFixed(2)}</td>
                  <td className="py-2 text-right">
                    <button
                      type="button"
                      className="mr-2 text-xs text-teal-600 hover:underline"
                      onClick={() => editar(b)}
                    >
                      Editar
                    </button>
                    {removendoId === b.id ? (
                      <span className="inline-flex items-center gap-2 text-xs text-slate-600">
                        Remover? <button type="button" className="font-semibold text-red-700 hover:underline" onClick={() => remover(b.id)}>Confirmar</button>
                        <button type="button" className="font-semibold text-[#006b5e] hover:underline" onClick={() => setRemovendoId(null)}>Não</button>
                      </span>
                    ) : <button
                      type="button"
                      className="text-xs text-red-600 hover:underline"
                      onClick={() => setRemovendoId(b.id)}
                    >
                      Remover
                    </button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}</>}
      </section>
    </div>
  );
}
