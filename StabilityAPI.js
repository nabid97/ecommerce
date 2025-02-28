// Stability API Test Script
// This script tests different approaches to interact with the Stability AI API

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Get your API key from the environment (or replace directly for testing)
const apiKey = "sk-wS5KwKQhPZF9peZbmPYKoHnRsbgS5EZdAIe7F3IFTPJP0xWq";

if (!apiKey) {
  console.error('STABILITY_API_KEY environment variable is not set!');
  console.error('Please set it using: export STABILITY_API_KEY=your_key_here');
  process.exit(1);
}

// Create output directory for saving generated images
const outputDir = path.join(__dirname, 'generated-images');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Test configuration
const testPrompt = "A professional logo with text 'Sample Company' in Arial font style. Blue color, white background. Clean, minimalist design.";

// Helper function to save base64 image data
const saveBase64Image = (base64Data, filename) => {
  // Remove the data URL prefix if present
  const data = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(data, 'base64');
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, buffer);
  console.log(`Image saved to: ${filePath}`);
  return filePath;
};

// Test different endpoints and approaches
const runTests = async () => {
  console.log('STABILITY AI API TEST SCRIPT');
  console.log('==========================');
  console.log(`Using API key starting with: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 3)}`);
  console.log(`Test prompt: "${testPrompt}"`);
  console.log('==========================\n');

  // Test #1: Text-to-Image using V1 Endpoint (JSON)
  try {
    console.log('TEST #1: Text-to-Image V1 Endpoint...');
    const v1Response = await axios.post(
      'https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image',
      {
        text_prompts: [{ text: testPrompt, weight: 1 }],
        cfg_scale: 7,
        height: 512,
        width: 512,
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

    console.log(`V1 API Response Status: ${v1Response.status}`);
    if (v1Response.data && v1Response.data.artifacts && v1Response.data.artifacts.length > 0) {
      const imagePath = saveBase64Image(
        v1Response.data.artifacts[0].base64, 
        `v1-test-${Date.now()}.png`
      );
      console.log('✅ V1 Endpoint Test: SUCCESSFUL\n');
    } else {
      console.log('⚠️ V1 Endpoint Test: Response succeeded but no image data found\n');
    }
  } catch (error) {
    console.error('❌ V1 Endpoint Test: FAILED');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    console.log('\n');
  }

  // Test #2: V2Beta with FormData
  try {
    console.log('TEST #2: V2Beta Endpoint with FormData...');
    const form = new FormData();
    form.append('prompt', testPrompt);
    form.append('output_format', 'jpeg');
    
    const v2Response = await axios.post(
      'https://api.stability.ai/v2beta/stable-image/generate/sd3',
      form,
      {
        headers: { 
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'image/*',
          ...form.getHeaders()
        },
        responseType: 'arraybuffer'
      }
    );

    console.log(`V2Beta API Response Status: ${v2Response.status}`);
    console.log(`Content-Type: ${v2Response.headers['content-type']}`);

    if (v2Response.data) {
      const contentType = v2Response.headers['content-type'] || 'image/jpeg';
      const filePath = path.join(outputDir, `v2beta-test-${Date.now()}.jpg`);
      fs.writeFileSync(filePath, v2Response.data);
      console.log(`Image saved to: ${filePath}`);
      console.log('✅ V2Beta Endpoint Test: SUCCESSFUL\n');
    } else {
      console.log('⚠️ V2Beta Endpoint Test: Response succeeded but no image data found\n');
    }
  } catch (error) {
    console.error('❌ V2Beta Endpoint Test: FAILED');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      
      // Try to extract error message from binary response
      if (error.response.data) {
        try {
          const errorText = Buffer.from(error.response.data).toString();
          console.error('Response:', errorText);
        } catch (e) {
          console.error('Binary response couldn\'t be converted to text');
        }
      }
    } else {
      console.error('Error:', error.message);
    }
    console.log('\n');
  }

  // Test #3: Legacy SDXL Endpoint
  try {
    console.log('TEST #3: Legacy SDXL Endpoint...');
    const sdxlResponse = await axios.post(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', 
      {
        text_prompts: [
          {
            text: testPrompt,
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
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    console.log(`SDXL API Response Status: ${sdxlResponse.status}`);
    if (sdxlResponse.data && sdxlResponse.data.artifacts && sdxlResponse.data.artifacts.length > 0) {
      const imagePath = saveBase64Image(
        sdxlResponse.data.artifacts[0].base64, 
        `sdxl-test-${Date.now()}.png`
      );
      console.log('✅ SDXL Endpoint Test: SUCCESSFUL\n');
    } else {
      console.log('⚠️ SDXL Endpoint Test: Response succeeded but no image data found\n');
    }
  } catch (error) {
    console.error('❌ SDXL Endpoint Test: FAILED');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    console.log('\n');
  }

  console.log('==========================');
  console.log('TEST SUMMARY:');
  
  // You can add more tests here as needed
  
  console.log('==========================');
  console.log('IMPORTANT: If all tests failed, please check:');
  console.log('1. Your API key is correct and active');
  console.log('2. Your account has sufficient credits');
  console.log('3. You have network connectivity to the Stability API');
  console.log('4. The API endpoints used in this test are still current');
};

// Run the tests
runTests().catch(err => {
  console.error('Unhandled error during tests:', err);
});