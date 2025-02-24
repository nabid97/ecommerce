const axios = require('axios');

const deepseekService = {
  generateImage: async (prompt, options = {}) => {
    try {
      const response = await axios.post('https://api.deepseek.com/v3/images/generations', {
        prompt,
        n: options.n || 1,
        size: options.size || "1024x1024",
        response_format: options.response_format || "url",
        model: options.model || "deepseek-v3",
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
      const response = await axios.post('https://api.deepseek.com/v3/images/edits', {
        image: imageUrl,
        prompt: options.prompt || "Enhance this image",
        size: options.size || "1024x1024",
        response_format: "url"
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('DeepSeek API Error:', error.response?.data || error.message);
      throw new Error('Failed to enhance image');
    }
  },

  generateVariations: async (imageUrl, options = {}) => {
    try {
      const response = await axios.post('https://api.deepseek.com/v3/images/variations', {
        image: imageUrl,
        n: options.n || 1,
        size: options.size || "1024x1024",
        response_format: "url"
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('DeepSeek API Error:', error.response?.data || error.message);
      throw new Error('Failed to generate variations');
    }
  }
};

module.exports = deepseekService;