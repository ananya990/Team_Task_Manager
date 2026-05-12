import api from '@/lib/axios';
import { LoginFormData, RegisterFormData } from '@/types';

export const authService = {
  async register(data: RegisterFormData) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async login(data: LoginFormData) {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  async logout(refreshToken: string) {
    const res = await api.post('/auth/logout', { refreshToken });
    return res.data;
  },

  async refresh(refreshToken: string) {
    const res = await api.post('/auth/refresh', { refreshToken });
    return res.data;
  },

  async me() {
    const res = await api.get('/auth/me');
    return res.data;
  },
};