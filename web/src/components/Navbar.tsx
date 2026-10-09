import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

export default function Navbar() {
  const token = useAuthStore((s) => s.token);
  const tipo = useAuthStore((s) => s.tipo);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  function sair() {
    logout();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      <Link to="/" className="text-lg font-bold text-slate-900 hover:no-underline">
        MedConecta <span className="text-teal-600">AI</span>
      </Link>
      <nav className="flex items-center gap-4">
        {token ? (
          <>
            <span className="rounded-full bg-teal-50 px-3 py-0.5 text-xs capitalize text-teal-700">
              {tipo ?? 'usuario'}
            </span>
            <Link to="/painel" className="text-sm text-teal-600 hover:underline">
              Painel
            </Link>
            <Link to="/buscar" className="text-sm text-teal-600 hover:underline">
              Buscar
            </Link>
            {tipo === 'paciente' && (
              <Link to="/triagem" className="text-sm text-teal-600 hover:underline">
                Triagem
              </Link>
            )}
            <Link to="/minhas-consultas" className="text-sm text-teal-600 hover:underline">
              Consultas
            </Link>
            {tipo === 'profissional' && (
              <>
                <Link to="/agenda" className="text-sm text-teal-600 hover:underline">
                  Agenda
                </Link>
                <Link to="/no-show" className="text-sm text-teal-600 hover:underline">
                  No-show
                </Link>
              </>
            )}
            <Link to="/seguranca" className="text-sm text-teal-600 hover:underline">
              Seguranca
            </Link>
            <Link to="/notificacoes" className="text-sm text-teal-600 hover:underline">
              Notificacoes
            </Link>
            <button
              type="button"
              className="text-sm text-teal-600 hover:underline"
              onClick={sair}
            >
              Sair
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-teal-600 hover:underline">
              Entrar
            </Link>
            <Link to="/register" className="btn btn-primary">
              Criar conta
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
