import { useEffect, useState, type FormEvent } from 'react';
import {
  confirmarMfa,
  desativarMfa,
  iniciarMfa,
  obterMe,
  type MeResponse,
  type MfaSetupResponse,
} from '../api/account';

export default function Security() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [setup, setSetup] = useState<MfaSetupResponse | null>(null);
  const [codigo, setCodigo] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      setMe(await obterMe());
    } catch {
      setErro('Nao foi possivel carregar os dados da conta.');
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function startSetup() {
    setErro(null);
    setMsg(null);
    try {
      setSetup(await iniciarMfa());
    } catch {
      setErro('Nao foi possivel iniciar a configuracao (exclusivo do profissional).');
    }
  }

  async function onConfirmar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      await confirmarMfa(codigo);
      setMsg('MFA ativado com sucesso.');
      setSetup(null);
      setCodigo('');
      await carregar();
    } catch {
      setErro('Codigo invalido. Tente novamente.');
    }
  }

  async function onDesativar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      await desativarMfa(codigo);
      setMsg('MFA desativado.');
      setCodigo('');
      await carregar();
    } catch {
      setErro('Codigo invalido. Tente novamente.');
    }
  }

  if (!me) {
    return <p className="text-slate-500">Carregando...</p>;
  }

  return (
    <div className="mx-auto max-w-xl">
      <section className="pb-6">
        <h1 className="text-2xl font-bold text-slate-900">Seguranca</h1>
        <p className="mt-2 text-sm text-slate-500">
          Conta: {me.email} ({me.tipo})
        </p>
      </section>

      {msg && <p className="mb-4 text-sm text-green-700">{msg}</p>}
      {erro && <p className="mb-4 text-sm text-red-600">{erro}</p>}

      <section className="card">
        <h2 className="text-lg font-semibold text-slate-900">Verificacao em duas etapas (MFA)</h2>

        {me.tipo !== 'profissional' ? (
          <p className="mt-2 text-sm text-slate-500">
            MFA esta disponivel apenas para contas de profissional.
          </p>
        ) : me.mfaAtivo ? (
          <>
            <p className="mt-2 text-sm text-green-700">MFA ativo nesta conta.</p>
            <form onSubmit={onDesativar} className="mt-4 flex flex-col gap-3">
              <label className="field">
                Codigo do aplicativo (para desativar)
                <input
                  className="input"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  inputMode="numeric"
                  maxLength={6}
                  required
                />
              </label>
              <button type="submit" className="btn btn-ghost self-start">
                Desativar MFA
              </button>
            </form>
          </>
        ) : setup ? (
          <div className="mt-4 flex flex-col gap-3">
            <p className="text-sm text-slate-500">
              Escaneie o QR no seu aplicativo autenticador e informe o codigo gerado.
            </p>
            <img src={setup.qrDataUrl} alt="QR do MFA" className="h-44 w-44 self-center" />
            <p className="text-center text-xs text-slate-400">
              Segredo manual: <span className="font-mono">{setup.secret}</span>
            </p>
            <form onSubmit={onConfirmar} className="flex flex-col gap-3">
              <label className="field">
                Codigo de 6 digitos
                <input
                  className="input"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  inputMode="numeric"
                  maxLength={6}
                  required
                />
              </label>
              <button type="submit" className="btn btn-primary self-start">
                Confirmar e ativar
              </button>
            </form>
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm text-slate-500">
              Ainda nao configurado. Ative para exigir um codigo no login.
            </p>
            <button type="button" className="btn btn-primary mt-4" onClick={startSetup}>
              Ativar MFA
            </button>
          </>
        )}
      </section>
    </div>
  );
}
