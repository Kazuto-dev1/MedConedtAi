import { api } from './client';

export interface BlocoAgenda {
  id: string;
  especialidadeId: string;
  especialidade: string | null;
  local: string | null;
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  preco: number;
}

export interface BlocoInput {
  especialidadeId: string;
  local?: string;
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  preco: number;
}

export async function listarMinhaAgenda(): Promise<BlocoAgenda[]> {
  const { data } = await api.get<BlocoAgenda[]>('/agenda');
  return data;
}

export async function criarBloco(input: BlocoInput): Promise<{ id: string }> {
  const { data } = await api.post('/agenda', input);
  return data;
}

export async function atualizarBloco(
  id: string,
  input: Partial<BlocoInput>,
): Promise<{ id: string }> {
  const { data } = await api.patch(`/agenda/${id}`, input);
  return data;
}

export async function removerBloco(id: string): Promise<{ id: string; removido: boolean }> {
  const { data } = await api.delete(`/agenda/${id}`);
  return data;
}
