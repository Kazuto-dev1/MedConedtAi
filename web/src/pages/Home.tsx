import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

const recursos = [
  { titulo: 'Triagem inteligente', texto: 'Chat que interpreta sintomas e sugere a especialidade, sem diagnostico.' },
  { titulo: 'Priorizacao de risco', texto: 'Estratificacao de risco com foco no rastreamento do cancer do colo do utero.' },
  { titulo: 'Matching de profissionais', texto: 'Ordenacao por especialidade, urgencia, local, preco e avaliacoes.' },
  { titulo: 'Agendamento e teleconsulta', texto: 'Consulta presencial ou por video, com pagamento integrado.' },
  { titulo: 'Previsao de faltas', texto: 'Estimativa de no-show e lembretes reforcados.' },
  { titulo: 'Painel do profissional', texto: 'Gestao autonoma de agenda, precos e recebimentos.' },
];

export default function Home() {
  const token = useAuthStore((s) => s.token);

  return (
    <div>
      <section className="py-10 text-center">
        <h1 className="mx-auto max-w-2xl text-4xl font-bold text-slate-900">
          Sua consulta, no lugar certo e no tempo certo.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-slate-500">
          O MedConecta AI conecta pacientes e profissionais de saude em um unico ambiente,
          com triagem assistida por inteligencia artificial e priorizacao de risco.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {token ? (
            <Link to="/painel" className="btn btn-primary">
              Ir para o painel
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary">
                Criar conta
              </Link>
              <Link to="/login" className="btn btn-ghost">
                Entrar
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recursos.map((r) => (
          <article key={r.titulo} className="card">
            <h3 className="mb-2 text-base font-semibold text-slate-900">{r.titulo}</h3>
            <p className="leading-relaxed text-slate-500">{r.texto}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
