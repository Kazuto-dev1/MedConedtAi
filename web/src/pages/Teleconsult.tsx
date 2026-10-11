import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  abrirSessao,
  encerrarSessao,
  type SessaoTeleconsulta,
} from '../api/teleconsult';

const COR_STATUS: Record<string, string> = {
  aguardando: 'bg-amber-100 text-amber-700',
  em_andamento: 'bg-green-100 text-green-700',
  encerrada: 'bg-slate-200 text-slate-600',
};

const LABEL_STATUS: Record<string, string> = {
  aguardando: 'Aguardando',
  em_andamento: 'Em andamento',
  encerrada: 'Encerrada',
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

export default function Teleconsult() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [sessao, setSessao] = useState<SessaoTeleconsulta | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [encerrando, setEncerrando] = useState(false);
  const [encerrada, setEncerrada] = useState(false);
  const [confirmarEncerramento, setConfirmarEncerramento] = useState(false);

  useEffect(() => {
    if (!appointmentId) return;
    abrirSessao(appointmentId)
      .then(setSessao)
      .catch(() => setErro('Nao foi possivel abrir a sala.'))
      .finally(() => setLoading(false));
  }, [appointmentId]);

  async function encerrar() {
    if (!appointmentId) return;
    setEncerrando(true);
    try {
      await encerrarSessao(appointmentId);
      setEncerrada(true);
      setConfirmarEncerramento(false);
    } catch {
      setErro('Nao foi possivel encerrar a consulta.');
    } finally {
      setEncerrando(false);
    }
  }

  if (loading) return <p role="status" className="text-slate-500">Carregando sala...</p>;
  if (erro) return <p role="alert" className="text-red-700">{erro}</p>;
  if (!sessao) return null;

  const encerradaFinal = encerrada || sessao.status === 'encerrada' || sessao.consultaStatus === 'concluida';

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/minhas-consultas" className="text-sm text-teal-600 hover:underline">
        &larr; Minhas consultas
      </Link>

      <section className="card mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Teleconsulta com {sessao.contraparte}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {formatar(sessao.inicio)} - {formatar(sessao.fim)}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              COR_STATUS[encerradaFinal ? 'encerrada' : sessao.status] ?? 'bg-slate-100 text-slate-600'
            }`}
          >
            {LABEL_STATUS[encerradaFinal ? 'encerrada' : sessao.status]}
          </span>
        </div>
      </section>

      <section className="card mt-4">
        <div className="flex aspect-video items-center justify-center rounded-lg bg-slate-800 text-center text-slate-300">
          <div>
            <p className="text-lg font-medium">Sala de video</p>
            <p className="mt-1 text-sm">
              {encerradaFinal
                ? 'Consulta encerrada.'
                : sessao.canJoin
                  ? 'Pronto para entrar.'
                  : 'A sala abre 15 minutos antes do horario.'}
            </p>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-400">
          MVP: o video real sera fornecido via WebRTC (provedor Daily.co). Abaixo, o link da sala.
        </p>

        <div className="mt-3 flex flex-wrap gap-3">
          <a
            href={sessao.url}
            target="_blank"
            rel="noreferrer"
            className={`btn btn-primary ${!sessao.canJoin || encerradaFinal ? 'pointer-events-none opacity-60' : ''}`}
          >
            Abrir sala no provedor
          </a>
          {!encerradaFinal && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setConfirmarEncerramento(true)}
              disabled={encerrando}
            >
              {encerrando ? 'Encerrando...' : 'Encerrar consulta'}
            </button>
          )}
        </div>
        {confirmarEncerramento && (
          <div className="confirmation-panel" role="alert">
            <p><strong>Encerrar a consulta agora?</strong> Os participantes perderão o acesso à sala.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn btn-danger" onClick={encerrar} disabled={encerrando}>{encerrando ? 'Encerrando...' : 'Encerrar consulta'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => setConfirmarEncerramento(false)} disabled={encerrando}>Continuar consulta</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
