import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import AccessibilityControls from './AccessibilityControls';

export default function Navbar() {
  const token = useAuthStore((s) => s.token);
  const tipo = useAuthStore((s) => s.tipo);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);

  function sair() {
    logout();
    navigate('/');
  }

  return (
    <header className="site-header sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8 lg:px-10">
      <Link to="/" className="brand flex items-center gap-2 hover:no-underline" onClick={() => setMenuAberto(false)}>
        <span className="brand-mark" aria-hidden="true">+</span>
        <span>Med<span>Conecta</span></span>
      </Link>
      <AccessibilityControls />
      <button type="button" className="menu-toggle" aria-label="Abrir menu" aria-expanded={menuAberto} onClick={() => setMenuAberto((aberto) => !aberto)}>
        <span /><span /><span />
      </button>
      <nav className={`site-nav ${menuAberto ? 'is-open' : ''}`} aria-label="Navegação principal">
        {token ? (
          <>
            <span className="rounded-full bg-teal-50 px-3 py-0.5 text-xs capitalize text-teal-700">
              {tipo ?? 'usuario'}
            </span>
            <Link to="/painel" onClick={() => setMenuAberto(false)} className="nav-link">
              Painel
            </Link>
            <Link to="/buscar" onClick={() => setMenuAberto(false)} className="nav-link">
              Buscar
            </Link>
            {tipo === 'paciente' && (
              <Link to="/triagem" onClick={() => setMenuAberto(false)} className="nav-link">
                Triagem
              </Link>
            )}
            <Link to="/minhas-consultas" onClick={() => setMenuAberto(false)} className="nav-link">
              Consultas
            </Link>
            {tipo === 'profissional' && (
              <>
                <Link to="/agenda" onClick={() => setMenuAberto(false)} className="nav-link">
                  Agenda
                </Link>
                <Link to="/no-show" onClick={() => setMenuAberto(false)} className="nav-link">
                  No-show
                </Link>
              </>
            )}
            <Link to="/seguranca" onClick={() => setMenuAberto(false)} className="nav-link">
              Seguranca
            </Link>
            <Link to="/notificacoes" onClick={() => setMenuAberto(false)} className="nav-link">
              Notificacoes
            </Link>
            <button
              type="button"
              className="nav-link"
              onClick={sair}
            >
              Sair
            </button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={() => setMenuAberto(false)} className="nav-link">
              Entrar
            </Link>
            <Link to="/register" onClick={() => setMenuAberto(false)} className="btn btn-primary">
              Criar conta
            </Link>
          </>
        )}
        <Link to="/ajuda" onClick={() => setMenuAberto(false)} className="nav-link">Ajuda</Link>
      </nav>
      </div>
    </header>
  );
}
