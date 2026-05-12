import api from '@/lib/axios';
import { ProjectFormData } from '@/types';

export const projectService = {
  async getAll(params?: Record<string, string | number>) {
    const res = await api.get('/projects', { params });
    return res.data;
  },

  async getById(id: string) {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  },

  async create(data: ProjectFormData) {
    const res = await api.post('/projects', data);
    return res.data;
  },

  async update(id: string, data: Partial<ProjectFormData>) {
    const res = await api.put(`/projects/${id}`, data);
    return res.data;
  },

  async delete(id: string) {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  },

  async addMember(projectId: string, userId: string) {
    const res = await api.post(`/projects/${projectId}/members`, {
      userId,
    });
    return res.data;
  },

  async removeMember(projectId: string, userId: string) {
    const res = await api.delete(
      `/projects/${projectId}/members/${userId}`
    );
    return res.data;
  },
};