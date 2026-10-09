import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const validateMfa = useAuthStore((s) => s.validateMfa);
  const loading = useAuthStore((s) => s.loading);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [codigo, setCodigo] = useState('');
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      const r = await login(email, senha);
      if (r.mfaRequired && r.mfaToken) {
        setMfaToken(r.mfaToken);
      } else {
        navigate('/painel');
      }
    } catch {
      setErro('Nao foi possivel entrar. Verifique e-mail e senha.');
    }
  }

  async function onMfaSubmit(e: FormEvent) {
    e.preventDefault();
    if (!mfaToken) return;
    setErro(null);
    try {
      await validateMfa(mfaToken, codigo);
      navigate('/painel');
    } catch {
      setErro('Codigo de verificacao invalido.');
    }
  }

  return (
    <div className="flex justify-center pt-4">
      {mfaToken ? (
        <form onSubmit={onMfaSubmit} className="card flex w-full max-w-md flex-col gap-4">
          <h2 className="text-xl font-semibold">Verificacao em duas etapas</h2>
          <p className="text-sm text-slate-500">
            Informe o codigo de 6 digitos do seu aplicativo autenticador.
          </p>
          <label className="field">
            Codigo
            <input
              className="input"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              inputMode="numeric"
              maxLength={6}
              required
              autoFocus
            />
          </label>
          {erro && <p className="text-sm text-red-600">{erro}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Verificando...' : 'Verificar'}
          </button>
        </form>
      ) : (
        <form onSubmit={onSubmit} className="card flex w-full max-w-md flex-col gap-4">
          <h2 className="text-xl font-semibold">Entrar</h2>
          <label className="field">
            E-mail
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label className="field">
            Senha
            <input
              type="password"
              className="input"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={8}
              autoComplete="current-password"
            />
          </label>
          {erro && <p className="text-sm text-red-600">{erro}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <p className="text-center text-sm text-slate-500">
            <Link to="/esqueci-senha" className="text-teal-600 hover:underline">
              Esqueci minha senha
            </Link>
          </p>
          <p className="text-center text-sm text-slate-500">
            Nao tem conta?{' '}
            <Link to="/register" className="text-teal-600 hover:underline">
              Criar conta
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
