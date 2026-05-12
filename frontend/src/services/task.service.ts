import api from '@/lib/axios';
import { TaskFormData } from '@/types';

export const taskService = {
  async getAll(params?: Record<string, string | number>) {
    const res = await api.get('/tasks', { params });
    return res.data;
  },

  async getById(id: string) {
    const res = await api.get(`/tasks/${id}`);
    return res.data;
  },

  async create(data: TaskFormData) {
    const res = await api.post('/tasks', data);
    return res.data;
  },

  async update(id: string, data: Partial<TaskFormData>) {
    const res = await api.put(`/tasks/${id}`, data);
    return res.data;
  },

  async delete(id: string) {
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
  },
};