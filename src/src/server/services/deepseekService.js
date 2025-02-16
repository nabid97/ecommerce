const axios = import('axios');

const deepseekService = {
  generateImage: async (prompt, options = {}) => {
    try {
      const response = await axios.post(`${process.env.DEEPSEEK_API_URL}/images/generations`, {
        prompt,
        n: options.n || 1,
        size: options.size || "1024x1024",
        response_format: options.response_format || "url",
        model: options.model || "deepseek-v1",
        quality: options.quality || "standard",
        style: options.style || "natural"
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('DeepSeek API Error:', error.response?.data || error.message);
      throw new Error('Failed to generate image');
    }
  },

  enhanceImage: async (imageUrl, options = {}) => {
    try {
      const response = await axios.post(`${process.env.DEEPSEEK_API_URL}/images/variations`, {
        image: imageUrl,
        prompt: options.prompt || "Enhance this image",
        size: options.size || "1024x1024",
        response_format: "url",
        n: options.n || 1
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('DeepSeek Enhancement Error:', error.response?.data || error.message);
      throw new Error('Failed to enhance image');
    }
  },

  generateLogo: async (config) => {
    try {
      const prompt = `Generate a professional ${config.style} logo with text "${config.text}" 
        in ${config.font} font. Use ${config.color} as main color and ${config.backgroundColor} 
        as background. Make it ${config.size} in size. Style should be clean and professional.`;

      const response = await axios.post(`${process.env.DEEPSEEK_API_URL}/images/generations`, {
        prompt,
        n: 1,
        size: "1024x1024",
        response_format: "url",
        model: "deepseek-v1",
        quality: "high",
        style: "logo"
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('DeepSeek Logo Generation Error:', error.response?.data || error.message);
      throw new Error('Failed to generate logo');
    }
  }
};

module.exports = deepseekService;