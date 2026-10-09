import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { redefinirSenha } from '../api/account';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [novaSenha, setNovaSenha] = useState('');
  const [ok, setOk] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      await redefinirSenha(token, novaSenha);
      setOk(true);
    } catch {
      setErro('Token invalido ou expirado. Solicite novamente.');
    }
  }

  return (
    <div className="flex justify-center pt-4">
      <form onSubmit={onSubmit} className="card flex w-full max-w-md flex-col gap-4">
        <h2 className="text-xl font-semibold">Definir nova senha</h2>
        {!token && <p className="text-sm text-red-600">Token ausente no link.</p>}
        <label className="field">
          Nova senha (min. 8 caracteres)
          <input
            type="password"
            className="input"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        {erro && <p className="text-sm text-red-600">{erro}</p>}
        {ok && <p className="text-sm text-green-700">Senha redefinida! Voce ja pode entrar.</p>}
        <button type="submit" className="btn btn-primary" disabled={!token || ok}>
          Redefinir
        </button>
        <p className="text-center text-sm text-slate-500">
          <Link to="/login" className="text-teal-600 hover:underline">
            Ir para o login
          </Link>
        </p>
      </form>
    </div>
  );
}
