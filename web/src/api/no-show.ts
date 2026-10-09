import { api } from './client';

export interface ItemNoShow {
  consultaId: string;
  inicio: string;
  modalidade: string;
  status: string;
  paciente: string;
  risco: 'baixo' | 'medio' | 'alto' | 'nao_avaliado';
  probabilidade: number | null;
  lembreteReforcado: boolean;
}

export async function painelNoShow(): Promise<ItemNoShow[]> {
  const { data } = await api.get<ItemNoShow[]>('/no-show/panel');
  return data;
}
