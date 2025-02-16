import api from '../utils/api';

export const logoApi = {
  generateLogo: async (config) => {
    const response = await api.post('/logos/generate', config);
    return response.data;
  },

  uploadLogo: async (file, config) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('config', JSON.stringify(config));

    const response = await api.post('/logos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  saveLogo: async (logoData) => {
    const response = await api.post('/logos/save', logoData);
    return response.data;
  },

  getLogos: async () => {
    const response = await api.get('/logos');
    return response.data;
  }
};