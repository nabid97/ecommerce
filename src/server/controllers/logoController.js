// src/server/controllers/logoController.js
const Logo = require('../models/Logo');
const stabilityService = require('../services/stabilityService');
const s3Service = require('../services/s3Service');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const logoController = {
  // Create Logo (Generate)
  generateLogo: async (req, res) => {
    try {
      console.log('\n====== LOGO GENERATION REQUEST ======');
      console.log('Request Body:', JSON.stringify(req.body, null, 2));
      
      // Debug environment variables
      console.log('Environment Variables:');
      if (process.env.STABILITY_API_KEY) {
        const key = process.env.STABILITY_API_KEY;
        console.log(`STABILITY_API_KEY: ${key.substring(0, 5)}...${key.substring(key.length - 3)}`);
      } else {
        console.log('STABILITY_API_KEY: not set');
      }

      const { prompt, config } = req.body;

      // Validate input
      if (!config || !config.text) {
        return res.status(400).json({ 
          message: 'Logo text is required',
          receivedBody: req.body 
        });
      }

      // Construct detailed prompt for logo generation
      const logoPrompt = prompt || `A professional ${config.style || 'modern'} logo design with text "${config.text}" 
        in ${config.font || 'Arial'} font style. 
        Main color ${config.color || '#000000'}, 
        background color ${config.backgroundColor || '#FFFFFF'}. 
        Clean, minimalist, business-appropriate logo. 
        High resolution, vector-style graphic.`;

      console.log('Logo Generation Prompt:', logoPrompt);

      try {
        // Generate logo using Stability AI
        const generatedImage = await stabilityService.generateImage(logoPrompt, {
          size: "1024x1024"
        });

        console.log('Generation Response:', {
          hasData: !!generatedImage.data,
          dataLength: generatedImage.data?.length,
          hasUrl: !!generatedImage.data?.[0]?.url,
          urlStart: generatedImage.data?.[0]?.url?.substring(0, 30) + '...' // Just log the start of the URL
        });

        // Validate image generation
        if (!generatedImage.data || !generatedImage.data[0]?.url) {
          console.error('Invalid response:', generatedImage);
          return res.status(500).json({ 
            message: 'Failed to generate logo',
            details: 'Invalid response from image generation service'
          });
        }

        let imageUrl = generatedImage.data[0].url;
        let logoData;
        
        // Handle base64 data URLs
        if (imageUrl.startsWith('data:image')) {
          console.log('Image is base64, using directly');
          logoData = {
            imageUrl: imageUrl,
            s3Key: null // No S3 key for base64 data
          };
        } else {
          try {
            // Download image using axios
            const imageResponse = await axios.get(imageUrl, { 
              responseType: 'arraybuffer' 
            });

            // Upload to S3 if configured
            if (process.env.AWS_S3_BUCKET && s3Service.uploadFile) {
              const uploadResult = await s3Service.uploadFile({
                buffer: Buffer.from(imageResponse.data),
                originalname: `logo-${Date.now()}.png`,
                mimetype: 'image/png'
              }, 'logos/generated');

              logoData = {
                imageUrl: uploadResult.url,
                s3Key: uploadResult.key
              };
            } else {
              // Save locally if S3 is not configured
              const uploadsDir = path.join(__dirname, '../../uploads/logos');
              if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
              }
              
              const filename = `logo-${Date.now()}.png`;
              const filePath = path.join(uploadsDir, filename);
              fs.writeFileSync(filePath, Buffer.from(imageResponse.data));
              
              logoData = {
                imageUrl: `/uploads/logos/${filename}`,
                s3Key: null
              };
            }
          } catch (downloadError) {
            console.error('Error downloading/saving image:', downloadError);
            
            // Still use the direct URL if download/upload failed
            logoData = {
              imageUrl: imageUrl,
              s3Key: null
            };
          }
        }

        // Save to database if possible
        try {
          const logo = new Logo({
            imageUrl: logoData.imageUrl,
            s3Key: logoData.s3Key,
            config: config,
            prompt: logoPrompt,
            type: 'generated',
            status: 'completed',
            userId: req.user ? req.user._id : null
          });

          await logo.save();
          console.log('Logo saved to database with ID:', logo._id);
        } catch (dbError) {
          console.error('Database error (non-fatal):', dbError);
          // Continue even if DB save fails
        }

        // Return response
        return res.status(200).json({
          imageUrl: logoData.imageUrl,
          message: 'Logo generated successfully',
          config: config
        });

      } catch (stabilityError) {
        console.error('Image Generation Error:', {
          message: stabilityError.message,
          stack: stabilityError.stack
        });

        return res.status(500).json({
          message: 'Failed to generate logo with Stability AI',
          error: stabilityError.message
        });
      }

    } catch (error) {
      console.error('Comprehensive Logo Generation Error:', {
        message: error.message,
        stack: error.stack
      });

      res.status(500).json({ 
        message: 'Unexpected error generating logo',
        error: error.message
      });
    }
  },

  // Test endpoint for Stability API
  generateLogoTest: async (req, res) => {
    try {
      console.log('\n====== STABILITY API TEST ======');
      
      // Debug environment variables
      if (process.env.STABILITY_API_KEY) {
        const key = process.env.STABILITY_API_KEY;
        console.log(`STABILITY_API_KEY: ${key.substring(0, 5)}...${key.substring(key.length - 3)}`);
      } else {
        console.log('STABILITY_API_KEY: not set');
        return res.status(500).json({ 
          error: 'API key not found', 
          message: 'STABILITY_API_KEY environment variable is not set' 
        });
      }
      
      // Simple prompt for testing
      const testPrompt = "Test logo for debugging";
      console.log(`Test prompt: "${testPrompt}"`);
      
      // Create form data for the request
      const form = new FormData();
      form.append('prompt', testPrompt);
      form.append('output_format', 'jpeg');
      
      console.log('Making test request to Stability AI API...');
      
      // Make the API request
      const response = await axios.post(
        'https://api.stability.ai/v2beta/stable-image/generate/sd3',
        form,
        {
          headers: { 
            'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
            'Accept': 'image/*',
            ...form.getHeaders()
          },
          responseType: 'arraybuffer'
        }
      );
      
      console.log(`Response status: ${response.status}`);
      console.log(`Content type: ${response.headers['content-type']}`);
      
      if (response.status === 200) {
        // Success - convert to base64 and return
        const base64Image = Buffer.from(response.data).toString('base64');
        const contentType = response.headers['content-type'] || 'image/jpeg';
        const dataUrl = `data:${contentType};base64,${base64Image}`;
        
        console.log('Test successful - image generated');
        console.log('====== END TEST ======\n');
        
        return res.status(200).json({
          success: true,
          message: 'Test successful',
          imageUrl: dataUrl
        });
      } else {
        // Error response
        let errorText = "Unknown error";
        try {
          errorText = Buffer.from(response.data).toString();
        } catch (e) {
          errorText = "Could not decode error response";
        }
        
        console.error(`Error response: ${errorText}`);
        console.log('====== END TEST ======\n');
        
        return res.status(response.status).json({
          success: false,
          error: `API returned status ${response.status}`,
          message: errorText
        });
      }
    } catch (error) {
      console.error('Test failed with error:', error.message);
      
      // Extract as much information as possible
      const errorDetail = {
        message: error.message,
        code: error.code
      };
      
      if (error.response) {
        errorDetail.status = error.response.status;
        errorDetail.statusText = error.response.statusText;
        
        try {
          const errorText = Buffer.from(error.response.data).toString();
          errorDetail.responseData = errorText;
        } catch (e) {
          errorDetail.responseData = "Could not decode error response";
        }
      }
      
      console.error('Error details:', JSON.stringify(errorDetail, null, 2));
      console.log('====== END TEST ======\n');
      
      return res.status(500).json({
        success: false,
        error: 'Test failed',
        details: errorDetail
      });
    }
  },
  // Add this method to your logoController.js:

// Simple clothing visualization (fallback that doesn't use Stability API)
simpleClothingVisualization: async (req, res) => {
  try {
    console.log('\n====== SIMPLE CLOTHING VISUALIZATION REQUEST ======');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    
    const { config } = req.body;
    
    // Validate request
    if (!config || !config.clothingType) {
      return res.status(400).json({ 
        message: 'Clothing configuration is required',
        receivedBody: req.body 
      });
    }

    // Create a placeholder URL with the clothing color and type
    const clothingType = config.clothingType === 'custom' ? 
      config.customDescription || 'clothing' : config.clothingType;
    
    const color = config.color === 'custom' ? 
      config.customColor || 'custom' : config.color;
      
    // Return a success response with a placeholder image URL
    return res.status(200).json({
      success: true,
      message: 'Simple visualization generated',
      imageUrl: `/api/placeholder/400/320?text=${color}+${clothingType}`,
      config: config
    });
    
  } catch (error) {
    console.error('Simple Visualization Error:', error);
    res.status(500).json({ 
      message: 'Error generating simple visualization',
      error: error.message
    });
  }
},
  // Generate clothing visualization
  generateClothingVisualization: async (req, res) => {
    try {
      console.log('\n====== CLOTHING VISUALIZATION REQUEST ======');
      console.log('Request Body:', JSON.stringify(req.body, null, 2));
      
      const { prompt, config } = req.body;
      
      // Validate request
      if (!config || !config.clothingType) {
        return res.status(400).json({ 
          message: 'Clothing configuration is required',
          receivedBody: req.body 
        });
      }
  
      // Use the same logic/service as your existing generateLogo method
      // This allows you to leverage your existing Stability AI integration
      
      // Simply pass the clothing-specific prompt to your existing image generation service
      // For example, if your logoController has a generateImage method or uses a service:
      try {
        // If you have an existing image generation service
        // const generatedImage = await yourImageGenerationService.generateImage(prompt);
        
        // For demonstration purposes, we'll use the same process as logo generation
        // but with the clothing-specific prompt
        const response = await axios.post('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
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
        }, {
          headers: { 
            'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
  
        // Process the response based on your existing pattern
        const imageUrl = response.data.artifacts[0].base64;
        const dataUrl = `data:image/png;base64,${imageUrl}`;
  
        return res.status(200).json({
          imageUrl: dataUrl,
          message: 'Clothing visualization generated successfully',
          config: config
        });
  
      } catch (stabilityError) {
        console.error('Image Generation Error:', {
          message: stabilityError.message,
          stack: stabilityError.stack
        });
  
        // Fallback to placeholder if API fails
        const placeholder = `https://via.placeholder.com/800x600/f5f5f5/333333?text=${encodeURIComponent(`${config.color} ${config.clothingType}`)}`;
        
        return res.status(200).json({
          imageUrl: placeholder,
          message: 'Using placeholder - Stability AI API error',
          error: stabilityError.message
        });
      }
  
    } catch (error) {
      console.error('Clothing Visualization Error:', {
        message: error.message,
        stack: error.stack
      });
  
      // Provide a fallback image even in case of errors
      const fallbackImage = `https://via.placeholder.com/800x600/f5f5f5/333333?text=Visualization%20Failed`;
      
      res.status(200).json({ 
        imageUrl: fallbackImage,
        message: 'Error occurred, using fallback image',
        error: error.message
      });
    }
  },
  // Test endpoint that directly tries multiple approaches
  testStabilityDirect: async (req, res) => {
    try {
      console.log('\n====== DIRECT STABILITY TEST ======');
      
      // Get the API key
      const apiKey = process.env.STABILITY_API_KEY;
      if (!apiKey) {
        console.error('STABILITY_API_KEY not found');
        return res.status(500).json({ 
          error: 'API key not found',
          message: 'STABILITY_API_KEY environment variable is not set'
        });
      }
      
      console.log(`API Key: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 3)}`);
      
      // Try JSON approach for simplicity
      const response = await axios({
        method: 'post',
        url: 'https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image',
        data: {
          text_prompts: [{ text: "Test logo for debugging", weight: 1 }],
          cfg_scale: 7,
          height: 512,
          width: 512,
          samples: 1,
          steps: 30
        },
        headers: { 
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log(`Response status: ${response.status}`);
      
      if (response.status === 200 && response.data.artifacts) {
        const base64Image = response.data.artifacts[0].base64;
        const dataUrl = `data:image/png;base64,${base64Image}`;
        
        return res.status(200).json({
          success: true,
          message: 'Direct test successful',
          imageUrl: dataUrl
        });
      } else {
        return res.status(response.status).json({
          success: false,
          error: `API returned status ${response.status}`,
          message: "Invalid response format"
        });
      }
    } catch (error) {
      console.error('Direct test failed with error:', error.message);
      
      // Prepare detailed error info
      const errorInfo = {
        message: error.message,
        code: error.code
      };
      
      if (error.response) {
        errorInfo.status = error.response.status;
        
        try {
          if (typeof error.response.data === 'string') {
            errorInfo.responseData = error.response.data;
          } else if (error.response.data instanceof Buffer) {
            errorInfo.responseData = error.response.data.toString();
          } else {
            errorInfo.responseData = JSON.stringify(error.response.data);
          }
        } catch (e) {
          errorInfo.responseData = "Could not decode error response";
        }
      }
      
      return res.status(500).json({
        success: false,
        error: 'Direct test failed',
        details: errorInfo
      });
    }
  },

  // Upload Logo
  uploadLogo: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Upload to S3 if configured
      let logoData;
      
      try {
        // Try S3 upload
        const uploadResult = await s3Service.uploadFile(req.file, 'logos/uploaded');
        logoData = {
          imageUrl: uploadResult.url,
          s3Key: uploadResult.key
        };
      } catch (uploadError) {
        console.error('S3 upload failed, using local storage:', uploadError);
        
        // Fallback to local storage
        const uploadsDir = path.join(__dirname, '../../uploads/logos');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const filename = `logo-${Date.now()}-${req.file.originalname}`;
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, req.file.buffer);
        
        logoData = {
          imageUrl: `/uploads/logos/${filename}`,
          s3Key: null
        };
      }

      // Try to save to database
      try {
        const logo = new Logo({
          imageUrl: logoData.imageUrl,
          s3Key: logoData.s3Key,
          type: 'uploaded',
          status: 'completed',
          userId: req.user ? req.user._id : null,
          metadata: {
            originalName: req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype
          }
        });

        await logo.save();
      } catch (dbError) {
        console.error('Database error (non-fatal):', dbError);
        // Continue without saving to database
      }

      res.status(200).json({ 
        message: 'Logo uploaded successfully', 
        logo: logoData
      });
    } catch (error) {
      console.error('Logo upload error:', error);
      res.status(500).json({ 
        message: 'Error uploading logo',
        error: error.message 
      });
    }
  },

  // Get All Logos
  getUserLogos: async (req, res) => {
    try {
      const userId = req.user?._id;
      
      // If user is authenticated, get their logos, otherwise return empty array
      const query = userId ? { userId } : {};
      const logos = await Logo.find(query).sort({ createdAt: -1 });
      
      res.status(200).json({ logos });
    } catch (error) {
      console.error('Get user logos error:', error);
      res.status(500).json({ 
        message: 'Error retrieving logos',
        error: error.message 
      });
    }
  },

  // Get Single Logo
  getLogo: async (req, res) => {
    try {
      const logo = await Logo.findById(req.params.id);
      
      if (!logo) {
        return res.status(404).json({ message: 'Logo not found' });
      }

      res.status(200).json(logo);
    } catch (error) {
      console.error('Get logo error:', error);
      res.status(500).json({ 
        message: 'Error retrieving logo',
        error: error.message 
      });
    }
  },

  // Update Logo
  updateLogo: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const logo = await Logo.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      );

      if (!logo) {
        return res.status(404).json({ message: 'Logo not found' });
      }

      res.status(200).json({ 
        message: 'Logo updated successfully', 
        logo 
      });
    } catch (error) {
      console.error('Update logo error:', error);
      res.status(500).json({ 
        message: 'Error updating logo',
        error: error.message 
      });
    }
  },

  // Delete Logo
  deleteLogo: async (req, res) => {
    try {
      const logo = await Logo.findByIdAndDelete(req.params.id);
      
      if (!logo) {
        return res.status(404).json({ message: 'Logo not found' });
      }

      // Delete from S3 if applicable
      if (logo.s3Key && s3Service.deleteFile) {
        try {
          await s3Service.deleteFile(logo.s3Key);
        } catch (deleteError) {
          console.error('Error deleting from S3 (non-fatal):', deleteError);
        }
      }

      res.status(200).json({ 
        message: 'Logo deleted successfully',
        deletedLogo: logo 
      });
    } catch (error) {
      console.error('Delete logo error:', error);
      res.status(500).json({ 
        message: 'Error deleting logo',
        error: error.message 
      });
    }
  }
};

module.exports = logoController;