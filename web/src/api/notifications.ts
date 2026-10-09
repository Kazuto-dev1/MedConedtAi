import { api } from './client';

export interface Notificacao {
  id: string;
  canal: 'push' | 'sms' | 'email';
  tipo: string;
  titulo: string | null;
  mensagem: string | null;
  status: 'enviado' | 'falha' | 'pendente';
  createdAt: string;
}

export async function listarNotificacoes(): Promise<Notificacao[]> {
  const { data } = await api.get<Notificacao[]>('/notifications');
  return data;
}
