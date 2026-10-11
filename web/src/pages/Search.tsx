import { useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  buscarProfissionais,
  listarEspecialidades,
  type Especialidade,
  type ProfissionalResumo,
} from '../api/catalog';

export default function Search() {
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [searchParams] = useSearchParams();
  const [especialidadeId, setEspecialidadeId] = useState(
    searchParams.get('especialidadeId') ?? '',
  );
  const [precoMax, setPrecoMax] = useState('');
  const [itens, setItens] = useState<ProfissionalResumo[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function buscar() {
    setLoading(true);
    setErro(null);
    try {
      const r = await buscarProfissionais({
        especialidadeId: especialidadeId || undefined,
        precoMax: precoMax ? Number(precoMax) : undefined,
      });
      setItens(r.itens);
      setTotal(r.total);
    } catch {
      setErro('Falha na busca. Verifique se a API esta no ar.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    listarEspecialidades()
      .then(setEspecialidades)
      .catch(() => setErro('Falha ao carregar especialidades.'));
    buscar();
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    buscar();
  }

  return (
    <div>
      <section className="pb-6">
        <h1 className="text-2xl font-bold text-slate-900">Buscar profissionais</h1>
        <p className="mt-2 text-slate-500">
          Ordenados por matching: disponibilidade, preco e especialidade.
        </p>
      </section>

      <form onSubmit={onSubmit} className="card mb-6 flex flex-wrap items-end gap-3">
        <label className="field flex-1 min-w-[200px]">
          Especialidade
          <select
            className="input"
            value={especialidadeId}
            onChange={(e) => setEspecialidadeId(e.target.value)}
          >
            <option value="">Todas</option>
            {especialidades.map((esp) => (
              <option key={esp.id} value={esp.id}>
                {esp.nome}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          Preco maximo (R$)
          <input
            type="number"
            min={0}
            className="input"
            value={precoMax}
            onChange={(e) => setPrecoMax(e.target.value)}
            placeholder="ex: 250"
          />
        </label>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {loading && <p role="status" className="mb-4 text-sm text-slate-500">Atualizando resultados...</p>}
      {erro && <div role="alert" className="mb-4 text-sm text-red-700"><p>{erro}</p><button type="button" className="mt-2 font-semibold text-[#006b5e] hover:underline" onClick={buscar}>Tentar novamente</button></div>}

      {!loading && !erro && (
        <p className="mb-3 text-sm text-slate-500">{total} profissional(is) encontrado(s).</p>
      )}

      {!loading && !erro && itens.length === 0 && <p className="card text-slate-600">Nenhum profissional encontrado com esses filtros. Tente ampliar sua busca.</p>}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        {itens.map((p) => (
          <article key={p.id} className="card flex flex-col">
            <h3 className="text-base font-semibold text-slate-900">{p.nome}</h3>
            <p className="mt-1 text-sm text-teal-700">{p.especialidades.join(' · ')}</p>
            {p.totalAvaliacoes > 0 && p.avaliacaoMedia != null && (
              <p className="mt-1 text-sm text-amber-600">
                ★ {p.avaliacaoMedia.toFixed(1)} ({p.totalAvaliacoes})
              </p>
            )}
            {p.bio && <p className="mt-2 flex-1 text-sm text-slate-500">{p.bio}</p>}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                {p.precoMin != null ? `a partir de R$ ${p.precoMin.toFixed(2)}` : 'sob consulta'}
              </span>
              <Link to={`/profissional/${p.id}`} className="btn btn-primary">
                Ver perfil
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
