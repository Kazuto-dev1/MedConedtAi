import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { esqueciSenha } from '../api/account';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setMsg(null);
    try {
      const r = await esqueciSenha(email);
      setMsg(r.message);
      if (r.token) setToken(r.token);
    } catch {
      setErro('Nao foi possivel solicitar a recuperacao.');
    }
  }

  return (
    <div className="flex justify-center pt-4">
      <form onSubmit={onSubmit} className="card flex w-full max-w-md flex-col gap-4">
        <h2 className="text-xl font-semibold">Recuperar senha</h2>
        <p className="text-sm text-slate-500">
          Informe seu e-mail para gerar as instrucoes de recuperacao.
        </p>
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
        {erro && <p className="text-sm text-red-600">{erro}</p>}
        {msg && <p className="text-sm text-green-700">{msg}</p>}
        {token && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <p className="text-slate-600">Ambiente de dev — link de redefinicao:</p>
            <Link
              to={`/redefinir-senha?token=${token}`}
              className="break-all text-teal-600 hover:underline"
            >
              /redefinir-senha?token={token.slice(0, 16)}...
            </Link>
          </div>
        )}
        <button type="submit" className="btn btn-primary">
          Enviar
        </button>
        <p className="text-center text-sm text-slate-500">
          <Link to="/login" className="text-teal-600 hover:underline">
            Voltar ao login
          </Link>
        </p>
      </form>
    </div>
  );
}
