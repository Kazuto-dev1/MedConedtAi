import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { cancelarConsulta, listarConsultas, type Consulta } from '../api/scheduling';
import { avaliarConsulta } from '../api/reviews';

const COR_STATUS: Record<string, string> = {
  confirmada: 'bg-green-100 text-green-700',
  pendente: 'bg-amber-100 text-amber-700',
  cancelada: 'bg-slate-200 text-slate-600',
  concluida: 'bg-teal-100 text-teal-700',
};

function formatar(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function elegivelAvaliar(c: Consulta): boolean {
  if (c.status === 'cancelada') return false;
  return c.status === 'concluida' || new Date(c.inicio).getTime() < Date.now();
}

export default function Appointments() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [cancelandoId, setCancelandoId] = useState<string | null>(null);
  const [processandoId, setProcessandoId] = useState<string | null>(null);

  const [avaliadas, setAvaliadas] = useState<Set<string>>(new Set());
  const [avaliandoId, setAvaliandoId] = useState<string | null>(null);
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('');

  async function carregar() {
    try {
      setConsultas(await listarConsultas());
    } catch {
      setErro('Nao foi possivel carregar as consultas.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function cancelar(id: string) {
    setProcessandoId(id);
    setErro(null);
    setMsg(null);
    try {
      await cancelarConsulta(id);
      await carregar();
      setMsg('Consulta cancelada. Você pode agendar outro horário quando quiser.');
    } catch {
      setErro('Não foi possível cancelar a consulta. Atualize a página e tente novamente.');
    } finally {
      setProcessandoId(null);
      setCancelandoId(null);
    }
  }

  function abrirAvaliacao(id: string) {
    setAvaliandoId(id);
    setNota(5);
    setComentario('');
    setMsg(null);
    setErro(null);
  }

  async function enviarAvaliacao(e: React.FormEvent) {
    e.preventDefault();
    if (!avaliandoId) return;
    try {
      await avaliarConsulta(avaliandoId, nota, comentario || undefined);
      setAvaliadas((s) => new Set(s).add(avaliandoId));
      setMsg('Avaliacao registrada. Obrigado!');
      setAvaliandoId(null);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setAvaliadas((s) => new Set(s).add(avaliandoId));
        setErro('Esta consulta ja foi avaliada.');
        setAvaliandoId(null);
      } else {
        setErro('Nao foi possivel enviar a avaliacao.');
      }
    }
  }

  return (
    <div>
      <section className="pb-6">
        <h1 className="text-2xl font-bold text-slate-900">Minhas consultas</h1>
      </section>

      {loading && <p role="status" className="text-slate-500">Carregando suas consultas...</p>}
      {erro && <p role="alert" className="mb-3 text-red-700">{erro}</p>}
      {msg && <p role="status" className="mb-3 text-sm text-green-700">{msg}</p>}

      {!loading && consultas.length === 0 && !erro && (
        <p className="text-slate-500">
          Nenhuma consulta ainda. Va em <strong>Buscar</strong> e agende um horario.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {consultas.map((c) => (
          <article key={c.id} className="card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-slate-900">{c.contraparte}</p>
                <p className="text-sm text-slate-500">
                  {formatar(c.inicio)} &middot; {c.modalidade}
                </p>
                {c.modalidade === 'teleconsulta' && c.status !== 'cancelada' && (
                  <Link
                    to={`/teleconsulta/${c.id}`}
                    className="mt-1 inline-block text-xs text-teal-600 hover:underline"
                  >
                    Entrar na teleconsulta
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                    COR_STATUS[c.status] ?? 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {c.status}
                </span>
                {c.status !== 'cancelada' && c.status !== 'concluida' && cancelandoId !== c.id && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setCancelandoId(c.id)}
                  >
                    Cancelar
                  </button>
                )}
                {elegivelAvaliar(c) && !avaliadas.has(c.id) && avaliandoId !== c.id && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => abrirAvaliacao(c.id)}
                  >
                    Avaliar
                  </button>
                )}
              </div>
            </div>

            {avaliandoId === c.id && (
              <form onSubmit={enviarAvaliacao} className="mt-4 border-t border-slate-200 pt-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`text-2xl ${n <= nota ? 'text-amber-500' : 'text-slate-300'}`}
                      onClick={() => setNota(n)}
                      aria-label={`${n} estrela(s)`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-slate-500">{nota}/5</span>
                </div>
                <textarea
                  className="input mt-3"
                  rows={2}
                  placeholder="Comentario (opcional)"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                />
                <div className="mt-3 flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    Enviar avaliacao
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setAvaliandoId(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
            {cancelandoId === c.id && (
              <div className="confirmation-panel" role="alert">
                <p><strong>Cancelar esta consulta?</strong> Esta ação não pode ser desfeita.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className="btn btn-danger" onClick={() => cancelar(c.id)} disabled={processandoId === c.id}>
                    {processandoId === c.id ? 'Cancelando...' : 'Sim, cancelar consulta'}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setCancelandoId(null)} disabled={processandoId === c.id}>Manter consulta</button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
