import { useEffect, useState } from 'react';
import { painelNoShow, type ItemNoShow } from '../api/no-show';

const COR_RISCO: Record<string, string> = {
  alto: 'bg-red-100 text-red-700',
  medio: 'bg-amber-100 text-amber-700',
  baixo: 'bg-green-100 text-green-700',
  nao_avaliado: 'bg-slate-100 text-slate-600',
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

export default function NoShowPanel() {
  const [itens, setItens] = useState<ItemNoShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    painelNoShow()
      .then(setItens)
      .catch(() => setErro('Nao foi possivel carregar o painel (acesso do profissional).'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="pb-6">
        <h1 className="text-2xl font-bold text-slate-900">Previsao de faltas</h1>
        <p className="mt-2 text-slate-500">
          Consultas ordenadas por risco de no-show. Lembrete reforcado quando &ge; 50%.
        </p>
      </section>

      {loading && <p className="text-slate-500">Carregando...</p>}
      {erro && <p className="text-red-600">{erro}</p>}
      {!loading && itens.length === 0 && !erro && (
        <p className="text-slate-500">Nenhuma consulta ativa.</p>
      )}

      {itens.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-2">Paciente</th>
                <th className="py-2">Data</th>
                <th className="py-2">Modalidade</th>
                <th className="py-2">Risco</th>
                <th className="py-2 text-right">Prob.</th>
                <th className="py-2 text-center">Lembrete</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((i) => (
                <tr key={i.consultaId} className="border-b border-slate-100">
                  <td className="py-2">{i.paciente}</td>
                  <td className="py-2">{formatar(i.inicio)}</td>
                  <td className="py-2">{i.modalidade}</td>
                  <td className="py-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                        COR_RISCO[i.risco] ?? 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {i.risco.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2 text-right">
                    {i.probabilidade != null ? `${(i.probabilidade * 100).toFixed(0)}%` : '-'}
                  </td>
                  <td className="py-2 text-center">{i.lembreteReforcado ? 'Sim' : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
