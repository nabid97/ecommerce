// src/server/services/stabilityService.js
// Optimized version based on endpoint testing results
const axios = require('axios');
const FormData = require('form-data');

const stabilityService = {
  generateImage: async (prompt, options = {}) => {
    console.log('Stability AI API Request with prompt:', prompt);
    
    // Check for API key
    if (!process.env.STABILITY_API_KEY) {
      throw new Error('STABILITY_API_KEY is required but not found in environment variables');
    }
    
    const apiKey = process.env.STABILITY_API_KEY;
    console.log(`Using API key: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 3)}`);
    
    try {
      // Primary approach: v2beta with FormData (confirmed working)
      console.log('Using v2beta API with FormData (primary approach)');
      return await v2BetaFormDataApproach(apiKey, prompt, options);
    } catch (error) {
      console.error('Primary approach failed:', error.message);
      
      // Fallback 1: Try v1 endpoint
      try {
        console.log('Falling back to v1 endpoint');
        return await v1Approach(apiKey, prompt, options);
      } catch (v1Error) {
        console.error('v1 fallback failed:', v1Error.message);
        
        // Fallback 2: Try legacy endpoint
        try {
          console.log('Falling back to legacy endpoint');
          return await legacyApproach(apiKey, prompt, options);
        } catch (legacyError) {
          console.error('All approaches failed');
          throw new Error(`Image generation failed with all approaches: ${error.message}`);
        }
      }
    }
  }
};

// Primary approach: v2beta with FormData (confirmed working)
async function v2BetaFormDataApproach(apiKey, prompt, options) {
  // Create FormData object
  const form = new FormData();
  form.append('prompt', prompt);
  form.append('output_format', 'jpeg');
  
  // Add optional parameters if provided
  if (options.width) form.append('width', options.width);
  if (options.height) form.append('height', options.height);
  
  console.log('Sending request to v2beta endpoint with FormData');
  
  const response = await axios.post(
    'https://api.stability.ai/v2beta/stable-image/generate/sd3',
    form,
    {
      headers: { 
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'image/*',
        ...form.getHeaders() // This is critical for FormData to work
      },
      responseType: 'arraybuffer'
    }
  );
  
  console.log(`v2beta response status: ${response.status}`);
  
  // Create a base64 string from the binary data
  const base64Image = Buffer.from(response.data).toString('base64');
  const contentType = response.headers['content-type'] || 'image/jpeg';
  const dataUrl = `data:${contentType};base64,${base64Image}`;
  
  return {
    data: [{
      url: dataUrl
    }]
  };
}

// Fallback 1: v1 endpoint (also confirmed working)
async function v1Approach(apiKey, prompt, options) {
  console.log('Sending request to v1 endpoint');
  
  const response = await axios.post(
    'https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image',
    {
      text_prompts: [{ text: prompt, weight: 1 }],
      cfg_scale: 7,
      height: options.height || 512,
      width: options.width || 512,
      samples: 1,
      steps: 30
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
  );
  
  console.log(`v1 response status: ${response.status}`);
  
  if (!response.data || !response.data.artifacts || !response.data.artifacts.length) {
    throw new Error('Invalid response format from V1 API');
  }
  
  // Get base64 data from response
  const base64Data = response.data.artifacts[0].base64;
  const dataUrl = `data:image/png;base64,${base64Data}`;
  
  return {
    data: [{
      url: dataUrl
    }]
  };
}

// Fallback 2: Legacy endpoint (also confirmed working)
async function legacyApproach(apiKey, prompt, options) {
  console.log('Sending request to legacy endpoint');
  
  const response = await axios.post(
    'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', 
    {
      text_prompts: [
        {
          text: prompt,
          weight: 1
        }
      ],
      cfg_scale: 7,
      height: options.height || 1024,
      width: options.width || 1024,
      samples: 1,
      steps: 30
    }, 
    {
      headers: { 
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
  );
  
  console.log(`Legacy response status: ${response.status}`);
  
  if (!response.data || !response.data.artifacts || !response.data.artifacts.length) {
    throw new Error('Invalid response format from legacy API');
  }
  
  // Get base64 data from response
  const base64Data = response.data.artifacts[0].base64;
  const dataUrl = `data:image/png;base64,${base64Data}`;
  
  return {
    data: [{
      url: dataUrl
    }]
  };
}

module.exports = stabilityService;