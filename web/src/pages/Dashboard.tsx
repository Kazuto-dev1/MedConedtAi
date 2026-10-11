import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarConsultas, type Consulta } from '../api/scheduling';
import { useAuthStore } from '../store/auth';

function formatar(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Dashboard() {
  const tipo = useAuthStore((s) => s.tipo);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(tipo === 'paciente');
  const [erro, setErro] = useState<string | null>(null);

  async function carregarConsultas() {
    if (tipo !== 'paciente') return;
    setLoading(true);
    setErro(null);
    try {
      setConsultas(await listarConsultas());
    } catch {
      setErro('Não foi possível carregar suas próximas consultas.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarConsultas();
  }, [tipo]);

  const proximas = consultas
    .filter((c) => c.status === 'confirmada')
    .slice(0, 3);

  const modulos = [
    'Triagem conversacional',
    'Teleconsulta (video)',
    'Notificacoes push/SMS',
    'Pagamento com split',
  ];

  return (
    <div>
      <section className="pb-6">
        <h1 className="text-2xl font-bold text-slate-900">Painel</h1>
        <p className="mt-2 text-slate-500">
          Voce esta autenticado como <strong>{tipo ?? 'usuario'}</strong>.
        </p>
        <div className="mt-4 flex gap-3">
          {tipo === 'paciente' ? (
            <>
              <Link to="/triagem" className="btn btn-primary">
                Fazer triagem
              </Link>
              <Link to="/buscar" className="btn btn-ghost">
                Buscar profissionais
              </Link>
            </>
          ) : (
            <>
              <Link to="/agenda" className="btn btn-primary">
                Minha agenda
              </Link>
              <Link to="/minhas-consultas" className="btn btn-ghost">
                Minhas consultas
              </Link>
              <Link to="/no-show" className="btn btn-ghost">
                Previsao de faltas
              </Link>
            </>
          )}
        </div>
      </section>

      {tipo === 'paciente' && (
        <section className="card mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Proximas consultas</h2>
            <Link to="/minhas-consultas" className="text-sm text-teal-600 hover:underline">
              Ver todas
            </Link>
          </div>
          {loading ? <p role="status" className="mt-2 text-sm text-slate-500">Carregando consultas...</p> : erro ? (
            <div role="alert" className="mt-2 text-sm text-red-700"><p>{erro}</p><button type="button" className="mt-1 font-semibold text-[#006b5e] hover:underline" onClick={carregarConsultas}>Tentar novamente</button></div>
          ) : proximas.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">
              Nenhuma consulta marcada. Va em <strong>Buscar</strong> para agendar.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {proximas.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="font-medium text-slate-800">{c.contraparte}</p>
                    <p className="text-sm text-slate-500">
                      {formatar(c.inicio)} &middot; {c.modalidade}
                    </p>
                  </div>
                  {c.modalidade === 'teleconsulta' && (
                    <Link to={`/teleconsulta/${c.id}`} className="btn btn-ghost">
                      Entrar
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="card">
        <h3 className="mb-2 text-base font-semibold text-slate-900">A caminho</h3>
        <ul className="list-inside list-disc space-y-1 text-slate-500">
          {modulos.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
