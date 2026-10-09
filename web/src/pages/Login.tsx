import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      await login(email, senha);
      navigate('/painel');
    } catch {
      setErro('Nao foi possivel entrar. Verifique e-mail e senha.');
    }
  }

  return (
    <div className="flex justify-center pt-4">
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
          Nao tem conta?{' '}
          <Link to="/register" className="text-teal-600 hover:underline">
            Criar conta
          </Link>
        </p>
      </form>
    </div>
  );
}
