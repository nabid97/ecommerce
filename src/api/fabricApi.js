import api from '../utils/api';

export const fabricApi = {
  getFabrics: async () => {
    const response = await api.get('/fabrics');
    return response.data;
  },

  getFabricById: async (fabricId) => {
    const response = await api.get(`/fabrics/${fabricId}`);
    return response.data;
  },

  checkAvailability: async (fabricId, quantity) => {
    const response = await api.get(`/fabrics/${fabricId}/availability`, {
      params: { quantity }
    });
    return response.data;
  },

  getPricing: async (fabricId, quantity) => {
    const response = await api.get(`/fabrics/${fabricId}/pricing`, {
      params: { quantity }
    });
    return response.data;
  }
};