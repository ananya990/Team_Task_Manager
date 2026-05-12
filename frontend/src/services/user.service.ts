import api from '@/lib/axios';

export const userService = {
  async getAll() {
    const res = await api.get('/users');
    return res.data;
  },

  async getById(id: string) {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  async updateProfile(data: {
    name?: string;
    avatar?: string;
  }) {
    const res = await api.put('/users/profile', data);
    return res.data;
  },
};