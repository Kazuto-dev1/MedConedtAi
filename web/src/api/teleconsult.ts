import { api } from './client';

export interface SessaoTeleconsulta {
  appointmentId: string;
  salaId: string;
  url: string;
  provider: string;
  status: 'aguardando' | 'em_andamento' | 'encerrada';
  canJoin: boolean;
  inicio: string;
  fim: string;
  contraparte: string;
  consultaStatus: string;
}

export async function abrirSessao(appointmentId: string): Promise<SessaoTeleconsulta> {
  const { data } = await api.get<SessaoTeleconsulta>(
    `/teleconsult/${appointmentId}/session`,
  );
  return data;
}

export async function encerrarSessao(
  appointmentId: string,
): Promise<{ id: string; status: string }> {
  const { data } = await api.patch(`/teleconsult/${appointmentId}/end`, {});
  return data;
}
