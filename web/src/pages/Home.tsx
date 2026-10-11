import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import atendimentoMedconecta from '../assets/atendimento-medconecta.jpg';

const recursos = [
  { numero: '01', titulo: 'Triagem inteligente', texto: 'Conte seus sintomas e encontre o cuidado mais adequado, sem substituir o diagnóstico médico.' },
  { numero: '02', titulo: 'Profissionais perto de você', texto: 'Compare especialidades, disponibilidade e avaliações para escolher com segurança.' },
  { numero: '03', titulo: 'Consulta sem complicação', texto: 'Agende presencialmente ou por vídeo e acompanhe tudo em um único lugar.' },
];

export default function Home() {
  const token = useAuthStore((s) => s.token);

  return (
    <div className="home-page">
      <section className="hero-section grid items-center gap-10 py-8 lg:grid-cols-[1.05fr_.95fr] lg:py-16">
        <div className="hero-copy">
          <p className="eyebrow">SAÚDE QUE ACOLHE</p>
          <h1>Seu cuidado começa com uma boa conversa.</h1>
          <p className="hero-description">
            O MedConecta aproxima você de profissionais de saúde e torna cada etapa da sua jornada mais simples, humana e segura.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
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
          </div>
        <div className="hero-visual">
          <img src={atendimentoMedconecta} alt="Profissionais de saúde atendendo pacientes com o apoio do celular" />
          <div className="hero-shade" />
          <div className="hero-tag"><strong>Atendimento conectado</strong><span>Onde e quando você precisar</span></div>
        </div>
      </section>

      <section className="care-banner" aria-labelledby="care-banner-title">
        <img
          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=85"
          alt="Profissional de saúde em atendimento"
        />
        <div className="care-banner-content">
          <p className="eyebrow">CUIDADO QUE CONECTA</p>
          <h2 id="care-banner-title">Tecnologia para deixar o atendimento mais humano.</h2>
        </div>
      </section>

      <section className="journey-section">
        <div className="section-heading">
          <p className="eyebrow">COM VOCÊ EM CADA ETAPA</p>
          <h2>Saúde mais próxima, do seu jeito.</h2>
          <p>Uma experiência simples para você cuidar do que realmente importa.</p>
        </div>
      <div className="grid gap-0 border-y border-slate-200 md:grid-cols-3">
        {recursos.map((r) => (
          <article key={r.titulo} className="journey-item">
            <span className="journey-number">{r.numero}</span>
            <h3>{r.titulo}</h3>
            <p>{r.texto}</p>
          </article>
        ))}
      </div>
      </section>
    </div>
  );
}
