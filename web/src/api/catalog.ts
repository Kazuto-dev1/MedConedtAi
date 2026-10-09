import { api } from './client';

export interface Especialidade {
  id: string;
  nome: string;
}

export interface ProfissionalResumo {
  id: string;
  nome: string;
  registroCrm: string;
  bio: string | null;
  especialidades: string[];
  blocos: number;
  precoMin: number | null;
  avaliacaoMedia: number | null;
  totalAvaliacoes: number;
}

export interface BuscaResultado {
  total: number;
  page: number;
  perPage: number;
  itens: ProfissionalResumo[];
}

export interface AgendaItem {
  id: string;
  especialidade: string | null;
  local: string | null;
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  preco: number;
}

export interface AvaliacaoItem {
  id: string;
  nota: number;
  comentario: string | null;
  createdAt: string;
}

export interface ProfissionalDetalhe {
  id: string;
  nome: string;
  registroCrm: string;
  bio: string | null;
  reputacao: { media: number | null; total: number };
  avaliacoes: AvaliacaoItem[];
  agenda: AgendaItem[];
}

export async function listarEspecialidades(): Promise<Especialidade[]> {
  const { data } = await api.get<Especialidade[]>('/especialidades');
  return data;
}

export async function buscarProfissionais(params: {
  especialidadeId?: string;
  precoMax?: number;
}): Promise<BuscaResultado> {
  const { data } = await api.get<BuscaResultado>('/professionals', { params });
  return data;
}

export async function detalharProfissional(id: string): Promise<ProfissionalDetalhe> {
  const { data } = await api.get<ProfissionalDetalhe>(`/professionals/${id}`);
  return data;
}
