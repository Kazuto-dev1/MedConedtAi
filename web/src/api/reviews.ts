import { api } from './client';
import type { AvaliacaoItem } from './catalog';

export interface Reputacao {
  media: number | null;
  total: number;
  avaliacoes: AvaliacaoItem[];
}

export async function avaliarConsulta(
  consultaId: string,
  nota: number,
  comentario?: string,
): Promise<{ id: string; nota: number }> {
  const { data } = await api.post('/reviews', { consultaId, nota, comentario });
  return data;
}

export async function listarAvaliacoes(profissionalId: string): Promise<Reputacao> {
  const { data } = await api.get<Reputacao>(`/reviews/professional/${profissionalId}`);
  return data;
}
