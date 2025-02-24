const axios = require('axios');

const stabilityService = {
  generateImage: async (prompt, options = {}) => {
    try {
      console.log('Stability AI API Request:', {
        prompt,
        options
      });

      const response = await axios.post('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', 
        {
          text_prompts: [
            {
              text: prompt,
              weight: 1
            }
          ],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
          steps: 30
        }, 
        {
          headers: {
            'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'image/png'
          }
        }
      );

      console.log('Stability AI API Full Response:', response.data);

      // Stability AI returns base64 encoded images directly
      return {
        data: response.data.artifacts.map(artifact => ({
          url: `data:image/png;base64,${artifact.base64}`
        }))
      };
    } catch (error) {
      console.error('Stability AI API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });

      throw new Error(`Stability AI API Error: ${error.message}`);
    }
  },

  enhanceImage: async (imageUrl, options = {}) => {
    try {
      const response = await axios.post('https://api.stability.ai/v1/image-to-image', {
        image: imageUrl,
        prompt: options.prompt || "Enhance this image",
        // Add other Stability AI specific parameters
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Stability AI Enhancement Error:', error.response?.data || error.message);
      throw new Error('Failed to enhance image');
    }
  }
};

module.exports = stabilityService;