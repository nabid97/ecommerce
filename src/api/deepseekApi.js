import axios from 'axios';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1';

const deepseekApi = {
  generateImage: async (prompt, options = {}) => {
    try {
      const response = await axios.post(`${DEEPSEEK_API_URL}/images/generations`, {
        prompt,
        n: options.n || 1,
        size: options.size || "1024x1024",
        response_format: options.response_format || "url",
        model: options.model || "deepseek-v1",
        quality: options.quality || "standard",
        style: options.style || "natural"
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_DEEPSEEK_API_KEY}`,
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
      const response = await axios.post(`${DEEPSEEK_API_URL}/images/variations`, {
        image: imageUrl,
        prompt: options.prompt || "Enhance this image",
        size: options.size || "1024x1024",
        response_format: "url",
        n: options.n || 1
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_DEEPSEEK_API_KEY}`,
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

      const response = await axios.post(`${DEEPSEEK_API_URL}/images/generations`, {
        prompt,
        n: 1,
        size: "1024x1024",
        response_format: "url",
        model: "deepseek-v1",
        quality: "high",
        style: "logo"
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('DeepSeek Logo Generation Error:', error.response?.data || error.message);
      throw new Error('Failed to generate logo');
    }
  },

  generateVariations: async (imageUrl, count = 1) => {
    try {
      const response = await axios.post(`${DEEPSEEK_API_URL}/images/variations`, {
        image: imageUrl,
        n: count,
        size: "1024x1024",
        response_format: "url"
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('DeepSeek Variation Error:', error.response?.data || error.message);
      throw new Error('Failed to generate variations');
    }
  },

  // Utility function to format the prompt for logo generation
  formatLogoPrompt: (config) => {
    return `Create a professional ${config.style} logo design with the following specifications:
      - Text: "${config.text}"
      - Font: ${config.font}
      - Main Color: ${config.color}
      - Background: ${config.backgroundColor}
      - Size: ${config.size}
      - Additional Notes: Clean, professional, suitable for business use
      ${config.additionalInstructions ? `- Custom Instructions: ${config.additionalInstructions}` : ''}`;
  }
};

export default deepseekApi;