import { api } from './client';

export interface Slot {
  inicio: string;
  hora: string;
  especialidade: string | null;
  preco: number;
}

export interface Disponibilidade {
  data: string;
  slots: Slot[];
}

export interface Consulta {
  id: string;
  inicio: string;
  fim: string;
  status: string;
  modalidade: string;
  contraparte: string;
  linkTeleconsulta: string | null;
}

export async function buscarDisponibilidade(
  profissionalId: string,
  data: string,
): Promise<Disponibilidade> {
  const { data: resp } = await api.get<Disponibilidade>('/availability', {
    params: { profissionalId, data },
  });
  return resp;
}

export async function criarConsulta(payload: {
  profissionalId: string;
  modalidade: 'presencial' | 'teleconsulta';
  inicio: string;
  triagemId?: string;
}): Promise<Consulta> {
  const { data } = await api.post<Consulta>('/appointments', payload);
  return data;
}

export async function listarConsultas(): Promise<Consulta[]> {
  const { data } = await api.get<Consulta[]>('/appointments');
  return data;
}

export async function cancelarConsulta(id: string): Promise<{ id: string; status: string }> {
  const { data } = await api.patch(`/appointments/${id}/cancel`, {});
  return data;
}
