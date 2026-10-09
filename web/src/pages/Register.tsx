import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, type TipoUsuario } from '../store/auth';

export default function Register() {
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const [tipo, setTipo] = useState<TipoUsuario>('paciente');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [registroCrm, setRegistroCrm] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      await register({
        tipo,
        nome,
        email,
        senha,
        registroCrm: tipo === 'profissional' ? registroCrm : undefined,
      });
      setOk(true);
      setTimeout(() => navigate('/login'), 1200);
    } catch {
      setErro('Nao foi possivel criar a conta. O e-mail pode ja estar em uso.');
    }
  }

  return (
    <div className="flex justify-center pt-4">
      <form onSubmit={onSubmit} className="card flex w-full max-w-md flex-col gap-4">
        <h2 className="text-xl font-semibold">Criar conta</h2>

        <label className="field">
          Tipo de conta
          <select
            className="input"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoUsuario)}
          >
            <option value="paciente">Paciente</option>
            <option value="profissional">Profissional de saude</option>
          </select>
        </label>

        <label className="field">
          Nome completo
          <input
            className="input"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </label>

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
          Senha (min. 8 caracteres)
          <input
            type="password"
            className="input"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>

        {tipo === 'profissional' && (
          <label className="field">
            Registro (CRM)
            <input
              className="input"
              value={registroCrm}
              onChange={(e) => setRegistroCrm(e.target.value)}
              required
            />
          </label>
        )}

        {erro && <p className="text-sm text-red-600">{erro}</p>}
        {ok && <p className="text-sm text-green-700">Conta criada! Redirecionando para o login...</p>}

        <button type="submit" className="btn btn-primary">
          Criar conta
        </button>
        <p className="text-center text-sm text-slate-500">
          Ja tem conta?{' '}
          <Link to="/login" className="text-teal-600 hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
