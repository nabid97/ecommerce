import api from '../utils/api';

export const logoApi = {
  generateLogo: async (config) => {
    try {
      console.log('Logo Generation Request Config:', config);

      // Construct prompt
      const prompt = `Create a professional ${config.style || 'modern'} logo design with text "${config.text}" 
        in ${config.font || 'Arial'} font style. 
        Main color ${config.color || '#000000'}, 
        background color ${config.backgroundColor || '#FFFFFF'}. 
        Clean, minimalist, business-appropriate logo.
        ${config.additionalInstructions ? `Additional details: ${config.additionalInstructions}` : ''}`;

      // Add bucket information to request
      const requestData = { 
        prompt, 
        config,
        // Specify the S3 bucket to store the logo
        storage: {
          bucketName: 'ecommerce-website-generated-logo-2025',
          saveToUserProfile: true
        }
      };

      console.log('Sending logo generation request:', requestData);

      const response = await api.post('/logos/generate', requestData);

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
    try {
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('config', JSON.stringify(config));
      
      // Specify the S3 bucket
      formData.append('bucketName', 'ecommerce-website-generated-logo-2025');
      formData.append('saveToUserProfile', 'true');

      const response = await api.post('/logos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Logo upload error:', error);
      throw error;
    }
  },

  // Get user's stored logos
  getUserLogos: async () => {
    try {
      const response = await api.get('/logos/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching user logos:', error);
      throw error;
    }
  },

  // Get single logo by ID
  getLogos: async () => {
    try {
      console.log('Fetching logos from API');
      const response = await api.get('/logos');
      console.log('Logo API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getLogos:', error);
      throw error;
    }
  },

  // Delete a logo
  deleteLogo: async (logoId) => {
    try {
      const response = await api.delete(`/logos/${logoId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting logo:', error);
      throw error;
    }
  },

  // Update logo metadata
  
};