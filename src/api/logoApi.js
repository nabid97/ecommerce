import api from '../utils/api';

export const logoApi = {
  generateLogo: async (config) => {
    try {
      console.log('Logo Generation Request Config:', config);

      // Construct prompt
      const prompt = `A professional ${config.style || 'modern'} logo design with text "${config.text}" 
        in ${config.font || 'Arial'} font style. 
        Main color ${config.color || '#000000'}, 
        background color ${config.backgroundColor || '#FFFFFF'}. 
        Clean, minimalist, business-appropriate logo.`;

      const response = await api.post('/logos/generate', { 
        prompt, 
        config 
      });

      console.log('Logo Generation API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Logo generation API error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      throw error;
    }
  },

  uploadLogo: async (file, config = {}) => {
    const formData = new FormData();
    formData.append('logo', file);
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