import { create } from 'zustand';
import { api } from '../api/client';

export type TipoUsuario = 'paciente' | 'profissional';

export interface RegisterPayload {
  tipo: TipoUsuario;
  nome: string;
  email: string;
  senha: string;
  registroCrm?: string;
}

interface AuthState {
  token: string | null;
  tipo: TipoUsuario | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<TipoUsuario>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('access_token'),
  tipo: (localStorage.getItem('tipo') as TipoUsuario) ?? null,
  loading: false,

  login: async (email, senha) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/login', { email, senha });
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('tipo', data.tipo);
      set({ token: data.access_token, tipo: data.tipo });
      return data.tipo as TipoUsuario;
    } finally {
      set({ loading: false });
    }
  },

  register: async (payload) => {
    await api.post('/auth/register', payload);
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('tipo');
    set({ token: null, tipo: null });
  },
}));
