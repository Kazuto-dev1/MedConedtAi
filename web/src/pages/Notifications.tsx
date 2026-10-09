import { useEffect, useState } from 'react';
import { listarNotificacoes, type Notificacao } from '../api/notifications';

const ICONE_CANAL: Record<string, string> = {
  push: 'Push',
  sms: 'SMS',
  email: 'E-mail',
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

export default function Notifications() {
  const [itens, setItens] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    listarNotificacoes()
      .then(setItens)
      .catch(() => setErro('Nao foi possivel carregar as notificacoes.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-2xl">
      <section className="pb-6">
        <h1 className="text-2xl font-bold text-slate-900">Notificacoes</h1>
      </section>

      {loading && <p className="text-slate-500">Carregando...</p>}
      {erro && <p className="text-red-600">{erro}</p>}
      {!loading && itens.length === 0 && !erro && (
        <p className="text-slate-500">Nenhuma notificacao.</p>
      )}

      <div className="flex flex-col gap-3">
        {itens.map((n) => (
          <article key={n.id} className="card">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-slate-900">{n.titulo ?? n.tipo}</p>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {ICONE_CANAL[n.canal] ?? n.canal}
              </span>
            </div>
            {n.mensagem && <p className="mt-1 text-sm text-slate-600">{n.mensagem}</p>}
            <p className="mt-2 text-xs text-slate-400">
              {formatar(n.createdAt)} &middot; {n.status}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
