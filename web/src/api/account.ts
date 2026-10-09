import { api } from './client';

export interface MeResponse {
  id: string;
  email: string;
  tipo: 'paciente' | 'profissional';
  mfaAtivo: boolean;
}

export interface MfaSetupResponse {
  secret: string;
  otpauthUrl: string;
  qrDataUrl: string;
}

export async function obterMe(): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>('/auth/me');
  return data;
}

export async function iniciarMfa(): Promise<MfaSetupResponse> {
  const { data } = await api.post<MfaSetupResponse>('/auth/mfa/setup', {});
  return data;
}

export async function confirmarMfa(codigo: string): Promise<{ mfaAtivo: boolean }> {
  const { data } = await api.post('/auth/mfa/confirm', { codigo });
  return data;
}

export async function desativarMfa(codigo: string): Promise<{ mfaAtivo: boolean }> {
  const { data } = await api.post('/auth/mfa/disable', { codigo });
  return data;
}

export async function esqueciSenha(
  email: string,
): Promise<{ message: string; token?: string }> {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
}

export async function redefinirSenha(
  token: string,
  novaSenha: string,
): Promise<{ message: string }> {
  const { data } = await api.post('/auth/reset-password', { token, novaSenha });
  return data;
}
