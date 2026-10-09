import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { detalharProfissional, type ProfissionalDetalhe } from '../api/catalog';
import {
  buscarDisponibilidade,
  criarConsulta,
  type Consulta,
  type Disponibilidade,
} from '../api/scheduling';

const DIAS = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];

function hojeISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function formatar(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ProfessionalDetail() {
  const { id } = useParams<{ id: string }>();
  const [prof, setProf] = useState<ProfissionalDetalhe | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState(hojeISO());
  const [modalidade, setModalidade] = useState<'presencial' | 'teleconsulta'>('presencial');
  const [disp, setDisp] = useState<Disponibilidade | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [agendando, setAgendando] = useState(false);
  const [agendada, setAgendada] = useState<Consulta | null>(null);
  const [erroAgenda, setErroAgenda] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    detalharProfissional(id)
      .then(setProf)
      .catch(() => setErro('Nao foi possivel carregar o profissional.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function carregarDisponibilidade() {
    if (!id) return;
    setBuscando(true);
    setErroAgenda(null);
    try {
      setDisp(await buscarDisponibilidade(id, data));
    } catch {
      setErroAgenda('Nao foi possivel carregar os horarios.');
    } finally {
      setBuscando(false);
    }
  }

  useEffect(() => {
    carregarDisponibilidade();
  }, [id, data]);

  async function agendar(inicio: string) {
    if (!id) return;
    setAgendando(true);
    setAgendada(null);
    setErroAgenda(null);
    try {
      const nova = await criarConsulta({ profissionalId: id, modalidade, inicio });
      setAgendada(nova);
      await carregarDisponibilidade();
    } catch {
      setErroAgenda('Nao foi possivel agendar. O horario pode ter sido ocupado.');
    } finally {
      setAgendando(false);
    }
  }

  if (loading) return <p className="text-slate-500">Carregando...</p>;
  if (erro) return <p className="text-red-600">{erro}</p>;
  if (!prof) return null;

  return (
    <div>
      <Link to="/buscar" className="text-sm text-teal-600 hover:underline">
        &larr; Voltar para a busca
      </Link>

      <section className="card mt-4">
        <h1 className="text-2xl font-bold text-slate-900">{prof.nome}</h1>
        <p className="mt-1 text-sm text-slate-500">Registro: {prof.registroCrm}</p>
        <p className="mt-1 text-sm text-amber-600">
          {prof.reputacao.total > 0 && prof.reputacao.media != null
            ? `★ ${prof.reputacao.media.toFixed(1)} (${prof.reputacao.total} avaliacao(oes))`
            : 'Sem avaliacoes ainda'}
        </p>
        {prof.bio && <p className="mt-3 text-slate-600">{prof.bio}</p>}
      </section>

      {agendada && (
        <div className="mt-4 rounded-xl border border-green-300 bg-green-50 p-4">
          <p className="font-semibold text-green-800">Consulta marcada com sucesso!</p>
          <p className="mt-1 text-sm text-green-700">
            {prof.nome} &middot; {formatar(agendada.inicio)} &middot; {agendada.modalidade}
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link to="/minhas-consultas" className="btn btn-primary">
              Ver minhas consultas
            </Link>
            {agendada.modalidade === 'teleconsulta' && (
              <Link to={`/teleconsulta/${agendada.id}`} className="btn btn-ghost">
                Entrar na teleconsulta
              </Link>
            )}
          </div>
        </div>
      )}

      <section className="card mt-4">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Agendar consulta</h2>

        <div className="flex flex-wrap items-end gap-3">
          <label className="field">
            Data
            <input
              type="date"
              className="input"
              value={data}
              min={hojeISO()}
              onChange={(e) => setData(e.target.value)}
            />
          </label>
          <label className="field">
            Modalidade
            <select
              className="input"
              value={modalidade}
              onChange={(e) => setModalidade(e.target.value as 'presencial' | 'teleconsulta')}
            >
              <option value="presencial">Presencial</option>
              <option value="teleconsulta">Teleconsulta</option>
            </select>
          </label>
        </div>

        <div className="mt-4">
          {buscando && <p className="text-sm text-slate-500">Buscando horarios...</p>}
          {erroAgenda && <p className="text-sm text-red-600">{erroAgenda}</p>}

          {disp && !buscando && disp.slots.length === 0 && (
            <p className="text-sm text-slate-500">Sem horarios disponiveis nesta data.</p>
          )}

          {disp && disp.slots.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {disp.slots.map((s) => (
                <button
                  key={s.inicio}
                  type="button"
                  className="btn btn-ghost"
                  disabled={agendando}
                  onClick={() => agendar(s.inicio)}
                  title={`R$ ${s.preco.toFixed(2)}`}
                >
                  {s.hora}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Clique em um horario para marcar. Valores a partir da agenda do profissional.
        </p>
      </section>

      <section className="card mt-4">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Agenda semanal</h2>
        {prof.agenda.length === 0 ? (
          <p className="text-slate-500">Sem horarios cadastrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-2">Dia</th>
                  <th className="py-2">Horario</th>
                  <th className="py-2">Especialidade</th>
                  <th className="py-2">Local</th>
                  <th className="py-2 text-right">Preco</th>
                </tr>
              </thead>
              <tbody>
                {prof.agenda.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100">
                    <td className="py-2">{DIAS[a.diaSemana] ?? a.diaSemana}</td>
                    <td className="py-2">
                      {a.horaInicio} - {a.horaFim}
                    </td>
                    <td className="py-2">{a.especialidade ?? '-'}</td>
                    <td className="py-2">{a.local ?? '-'}</td>
                    <td className="py-2 text-right">R$ {a.preco.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card mt-4">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Avaliacoes</h2>
        {prof.avaliacoes.length === 0 ? (
          <p className="text-slate-500">Ainda sem avaliacoes.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {prof.avaliacoes.map((a) => (
              <li key={a.id} className="py-3">
                <p className="text-amber-600">
                  {'★'.repeat(a.nota)}
                  {'☆'.repeat(5 - a.nota)}
                </p>
                {a.comentario && (
                  <p className="mt-1 text-sm text-slate-600">{a.comentario}</p>
                )}
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(a.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
