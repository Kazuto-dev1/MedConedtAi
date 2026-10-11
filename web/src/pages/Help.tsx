import { Link } from 'react-router-dom';

export default function Help() {
  return (
    <div className="mx-auto max-w-3xl">
      <section className="pb-7">
        <p className="eyebrow">CENTRAL DE AJUDA</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Como podemos ajudar?</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-slate-600">
          Encontre orientações rápidas para agendar, acessar uma teleconsulta e cuidar da sua conta.
        </p>
      </section>

      <section className="space-y-3" aria-label="Dúvidas frequentes">
        <details className="help-item">
          <summary>Como agendo uma consulta?</summary>
          <p>Entre em <Link to="/buscar">Buscar profissionais</Link>, selecione um perfil, escolha data, modalidade e um horário disponível.</p>
        </details>
        <details className="help-item">
          <summary>Como entro em uma teleconsulta?</summary>
          <p>Abra <Link to="/minhas-consultas">Minhas consultas</Link> e selecione “Entrar na teleconsulta” no horário marcado. A sala fica disponível 15 minutos antes do início.</p>
        </details>
        <details className="help-item">
          <summary>Como cancelo uma consulta?</summary>
          <p>Em Minhas consultas, escolha “Cancelar” e confirme a solicitação. Você verá a confirmação antes de a alteração ser concluída.</p>
        </details>
        <details className="help-item">
          <summary>Como reforço a segurança da minha conta?</summary>
          <p>Profissionais podem ativar a verificação em duas etapas em <Link to="/seguranca">Segurança</Link>.</p>
        </details>
      </section>

      <aside className="mt-6 border-l-4 border-amber-500 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
        <strong>Em caso de emergência,</strong> procure imediatamente o serviço de urgência mais próximo ou ligue 192 (SAMU). O MedConecta não substitui atendimento de emergência.
      </aside>
    </div>
  );
}
