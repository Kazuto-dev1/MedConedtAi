import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { executarTriagem, type TriageResultado } from '../api/triage';

interface Msg {
  autor: 'bot' | 'user';
  texto: string;
}

const COR_RISCO: Record<TriageResultado['nivelRisco'], string> = {
  alto: 'bg-red-100 text-red-700',
  medio: 'bg-amber-100 text-amber-700',
  baixo: 'bg-green-100 text-green-700',
};

export default function Triage() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { autor: 'bot', texto: 'Ola! Vou fazer algumas perguntas para direcionar voce ao atendimento correto.' },
    { autor: 'bot', texto: 'Importante: esta triagem nao substitui o diagnostico medico.' },
    { autor: 'bot', texto: 'Qual a sua idade?' },
  ]);
  const [etapa, setEtapa] = useState(0); // 0 idade, 1 tempo, 2 historico, 3 sinais
  const [texto, setTexto] = useState('');
  const [idade, setIdade] = useState(0);
  const [tempo, setTempo] = useState<number | undefined>(undefined);
  const [historicoValor, setHistoricoValor] = useState(false);
  const [resultado, setResultado] = useState<TriageResultado | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const push = (msg: Msg) => setMsgs((m) => [...m, msg]);

  function enviarIdade(e: FormEvent) {
    e.preventDefault();
    const v = Number(texto);
    if (!v || v < 1 || v > 120) return;
    push({ autor: 'user', texto });
    setIdade(v);
    setTexto('');
    push({
      autor: 'bot',
      texto:
        'Ha quantos meses foi seu ultimo exame preventivo? Se nunca fez, clique em "Nunca fiz".',
    });
    setEtapa(1);
  }

  function enviarTempo(nunca?: boolean) {
    const valor = nunca ? undefined : Number(texto);
    push({ autor: 'user', texto: nunca ? 'Nunca fiz' : texto });
    setTempo(valor);
    setTexto('');
    push({
      autor: 'bot',
      texto: 'Algum exame preventivo anterior deu alterado?',
    });
    setEtapa(2);
  }

  async function concluir(historicoAlterado: boolean, sinaisAlerta: boolean) {
    push({ autor: 'user', texto: sinaisAlerta ? 'Sim' : 'Nao' });
    setLoading(true);
    setErro(null);
    try {
      const r = await executarTriagem({
        idade,
        tempoUltimoExameMeses: tempo,
        historicoAlterado,
        sinaisAlerta,
      });
      setResultado(r);
      setEtapa(4);
      push({
        autor: 'bot',
        texto: `Pronto! Prioridade: ${r.nivelRisco}. Especialidade sugerida: ${
          r.especialidadeSugerida ?? 'a definir'
        }.`,
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 403) {
          setErro('A triagem e exclusiva para pacientes. Entre com uma conta de paciente.');
        } else if (status === 401) {
          setErro('Sessao expirada. Faca login novamente.');
        } else if (!err.response) {
          setErro('Nao foi possivel falar com a API. Ela esta no ar?');
        } else {
          setErro(`Falha ao executar a triagem (HTTP ${status}).`);
        }
      } else {
        setErro('Falha ao executar a triagem.');
      }
    } finally {
      setLoading(false);
    }
  }

  function responderHistorico(v: boolean) {
    push({ autor: 'user', texto: v ? 'Sim' : 'Nao' });
    push({
      autor: 'bot',
      texto:
        'Voce tem algum sinal de alerta, como sangramento fora do periodo?',
    });
    setEtapa(3);
    setHistoricoValor(v);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <section className="pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Triagem</h1>
        <p className="mt-1 text-sm text-slate-500">
          Pre-triagem com priorizacao para o rastreamento.
        </p>
      </section>

      <div className="card flex flex-col gap-3">
        <div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
          {msgs.map((m, i) => (
            <div
              key={i}
              className={
                m.autor === 'bot'
                  ? 'max-w-[85%] self-start rounded-2xl rounded-bl-sm bg-slate-100 px-3 py-2 text-sm text-slate-700'
                  : 'max-w-[85%] self-end rounded-2xl rounded-br-sm bg-teal-600 px-3 py-2 text-sm text-white'
              }
            >
              {m.texto}
            </div>
          ))}
        </div>

        {erro && <p className="text-sm text-red-600">{erro}</p>}

        {etapa === 0 && (
          <form onSubmit={enviarIdade} className="flex gap-2">
            <input
              type="number"
              className="input"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Sua idade"
              min={1}
              max={120}
              autoFocus
            />
            <button type="submit" className="btn btn-primary">
              Enviar
            </button>
          </form>
        )}

        {etapa === 1 && (
          <div className="flex flex-wrap gap-2">
            <input
              type="number"
              className="input flex-1 min-w-[140px]"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Meses desde o ultimo exame"
              min={0}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => enviarTempo(false)}
              disabled={texto === ''}
            >
              Enviar
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => enviarTempo(true)}>
              Nunca fiz
            </button>
          </div>
        )}

        {etapa === 2 && (
          <div className="flex gap-2">
            <button type="button" className="btn btn-primary" onClick={() => responderHistorico(true)}>
              Sim
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => responderHistorico(false)}>
              Nao
            </button>
          </div>
        )}

        {etapa === 3 && (
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => concluir(historicoValor, true)}
              disabled={loading}
            >
              Sim
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => concluir(historicoValor, false)}
              disabled={loading}
            >
              Nao
            </button>
          </div>
        )}

        {etapa === 4 && resultado && (
          <div className="mt-2 border-t border-slate-200 pt-4">
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${COR_RISCO[resultado.nivelRisco]}`}>
                Risco {resultado.nivelRisco}
              </span>
              <span className="text-sm text-slate-500">
                probabilidade {(resultado.probabilidade * 100).toFixed(0)}%
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-500">{resultado.aviso}</p>
            <Link
              to={
                resultado.especialidadeSugeridaId
                  ? `/buscar?especialidadeId=${resultado.especialidadeSugeridaId}`
                  : '/buscar'
              }
              className="btn btn-primary mt-4"
            >
              Ver profissionais
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
