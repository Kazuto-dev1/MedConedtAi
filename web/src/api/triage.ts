import { api } from './client';

export interface TriageRespostas {
  idade: number;
  tempoUltimoExameMeses?: number;
  historicoAlterado: boolean;
  sinaisAlerta: boolean;
}

export interface TriageResultado {
  triagemId: string;
  nivelRisco: 'baixo' | 'medio' | 'alto';
  probabilidade: number;
  especialidadeSugerida: string | null;
  especialidadeSugeridaId: string | null;
  aviso: string;
}

export async function executarTriagem(
  respostas: TriageRespostas,
): Promise<TriageResultado> {
  const { data } = await api.post<TriageResultado>('/triage', respostas);
  return data;
}
