import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cancelarConsulta, listarConsultas, type Consulta } from '../api/scheduling';

const COR_STATUS: Record<string, string> = {
  confirmada: 'bg-green-100 text-green-700',
  pendente: 'bg-amber-100 text-amber-700',
  cancelada: 'bg-slate-200 text-slate-600',
  concluida: 'bg-teal-100 text-teal-700',
};

function formatar(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Appointments() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

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
    try {
      await cancelarConsulta(id);
      await carregar();
    } catch {
      setErro('Nao foi possivel cancelar a consulta.');
    }
  }

  return (
    <div>
      <section className="pb-6">
        <h1 className="text-2xl font-bold text-slate-900">Minhas consultas</h1>
      </section>

      {loading && <p className="text-slate-500">Carregando...</p>}
      {erro && <p className="text-red-600">{erro}</p>}

      {!loading && consultas.length === 0 && !erro && (
        <p className="text-slate-500">
          Nenhuma consulta ainda. Va em <strong>Buscar</strong> e agende um horario.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {consultas.map((c) => (
          <article key={c.id} className="card flex flex-wrap items-center justify-between gap-3">
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
              {c.status !== 'cancelada' && c.status !== 'concluida' && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => cancelar(c.id)}
                >
                  Cancelar
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
