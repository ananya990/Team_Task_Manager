import api from '@/lib/axios';

export const dashboardService = {
  async getStats() {
    const res = await api.get('/dashboard/stats');
    return res.data;
  },

  async getActivity(limit = 20) {
    const res = await api.get('/dashboard/activity', {
      params: { limit },
    });
    return res.data;
  },
};