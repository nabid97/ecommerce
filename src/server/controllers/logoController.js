// src/server/controllers/logoController.js
const mongoose = require('mongoose');
const Logo = require('../models/Logo');
const stabilityService = require('../services/stabilityService');
const AWS = require('aws-sdk');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const s3Service = require('../services/s3Service');
const { generatePreSignedUrl } = require('../../utils/LogoStorage');
const generateFullUrl = (req, path) => {
  
  // Ensure the path starts with a /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // For development environment
  if (process.env.NODE_ENV === 'development') {
    return `${req.protocol}://${req.get('host')}${cleanPath}`;
  }
  
  // For production, you might want to use a configured base URL
  return cleanPath;
};


// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const logoController = {

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
      Main color (RGB Hex code) ${config.color || '#000000'}, 
      background color (RGB Hex code) ${config.backgroundColor || '#FFFFFF'}Ensure the design is clean, minimalistic, and suitable for business use, do not include any extraneous elements or random text.
      For Primary and Background Colors, the hex code numbers provided corrisponds to RGB colours. 
      High resolution. 
    `;

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
  console.log('Image is base64, processing for upload...');
  
  try {
    // Extract the base64 data and determine mimetype
    const matches = imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 format');
    }
    
    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Upload to S3 if configured
    // Upload to S3 if configured
if (process.env.AWS_S3_BUCKET && s3Service.uploadFile) {
  const filename = `logo-${Date.now()}.png`; // Add this line to define filename
  const uploadResult = await s3Service.uploadFile({
    buffer: buffer,
    originalname: filename,
    mimetype: mimeType || 'image/png'
  }, 'logos/generated');

  logoData = {
    imageUrl: generateFullUrl(req, `/uploads/logos/${filename}`),
    s3Key: `logos/generated/${filename}`
  };
  console.log('Base64 image uploaded to S3:', uploadResult.url);
} else {
  // Save locally if S3 is not configured
  const uploadsDir = path.join(__dirname, '../../uploads/logos');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  const filename = `logo-${Date.now()}.png`;
  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, buffer);
  
  logoData = {
    imageUrl: generateFullUrl(req, `/uploads/logos/${filename}`),
    s3Key: `logos/generated/${filename}`
  };
  console.log('Base64 image saved locally:', logoData.imageUrl);
}
  }
   catch (uploadError) {
    console.error('Error processing base64 image:', uploadError);
    logoData = {
      imageUrl: imageUrl,
      s3Key: `placeholder-${Date.now()}` // Use a timestamp-based placeholder
    };
  }
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
      const uploadsDir = path.join(__dirname, '../../../uploads/logos');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      const filename = `logo-${Date.now()}.png`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, Buffer.from(imageResponse.data));
      
      logoData = {
        imageUrl: `/uploads/logos/${filename}`,
        s3Key: `logos/generated/${filename}` // Set a meaningful S3 key even for local storage
      };
    }
  } catch (downloadError) {
    console.error('Error downloading/saving image:', downloadError);
    
    // Still use the direct URL if download/upload failed
    logoData = {
      imageUrl: imageUrl,
      s3Key: `placeholder-${Date.now()}` // Use a timestamp-based placeholder
    };
  }
}

// Try to save to database (now with better error handling)
try {
  // Get user ID - either from logged in user or create a temp one
  const userId = req.user ? req.user._id : new mongoose.Types.ObjectId();
  
  // Create logo document with all required fields
  const logo = new Logo({
    imageUrl: logoData.imageUrl,
    s3Key: logoData.s3Key, // Will now always have a value
    userId: userId,
    prompt: logoPrompt,
    type: 'generated',
    status: 'completed'
  });

  await logo.save();
  console.log('Logo saved to database with ID:', logo._id);
} catch (dbError) {
  // If database save fails, log the error but continue
  console.error('Database save error (non-fatal):', dbError);
  console.log('Continuing without saving to database...');
}

// Return response whether database save worked or not
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
  
      // Build prompt based on provided config
      const clothingType = config.clothingType === 'custom' ? 
        config.customDescription : config.clothingType;
      
      const color = config.color === 'custom' ? 
        config.customColor : config.color;
      
      const style = config.style === 'custom' ? 
        config.customStyle : config.style;
      
      const fabric = config.fabric === 'custom' ? 
        config.customFabric : config.fabric;
      
      const logoPosition = config.logoPosition === 'custom' ?
        config.customLogoPosition : config.logoPosition;

      const logoSize = config.logoSize === 'custom' ?
        config.customLogoSize : config.logoSize;
      
      // Construct detailed prompt for clothing visualization
      const clothingPrompt = prompt || `Create a professional product photo of a ${color} ${style} ${clothingType} made of ${fabric} fabric. 
        The garment should have a logo positioned at the ${logoPosition} of the ${clothingType}.
        The logo is ${logoSize} in size. Clean product photography on white background, highly detailed, 
        professional lighting, 8k resolution, product visualization.`;

      console.log('Clothing Visualization Prompt:', clothingPrompt);

      try {
        // Generate image using Stability AI
        const generatedImage = await stabilityService.generateImage(clothingPrompt, {
          size: "1024x1024"
        });

        console.log('Generation Response:', {
          hasData: !!generatedImage.data,
          dataLength: generatedImage.data?.length,
          hasUrl: !!generatedImage.data?.[0]?.url,
          urlStart: generatedImage.data?.[0]?.url?.substring(0, 30) + '...' // Log the start of the URL
        });

        // Validate image generation
        if (!generatedImage.data || !generatedImage.data[0]?.url) {
          console.error('Invalid response:', generatedImage);
          return res.status(500).json({ 
            message: 'Failed to generate clothing visualization',
            details: 'Invalid response from image generation service'
          });
        }

        let imageUrl = generatedImage.data[0].url;
        let imageData;
        
        // Handle base64 data URLs
        if (imageUrl.startsWith('data:image')) {
          console.log('Image is base64, using directly');
          imageData = {
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
            if (process.env.AWS_S3_BUCKET || 'ecommerce-website-generated-logo-2025') {
              const uploadResult = await s3Service.uploadFile({
                buffer: Buffer.from(imageResponse.data),
                originalname: `logo-${config.text || Date.now()}.png`,
                mimetype: 'image/png'
              }, 'logos/generated');
            
              imageData = {
                imageUrl: uploadResult.url,
                s3Key: uploadResult.key
              };
              
              console.log('Logo saved to S3:', imageData);
            }
            else {
              // Save locally if S3 is not configured
              const uploadsDir = path.join(__dirname, '../../uploads/visualizations');
              if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
              }
              
              const filename = `clothing-${clothingType}-${Date.now()}.png`;
              const filePath = path.join(uploadsDir, filename);
              fs.writeFileSync(filePath, Buffer.from(imageResponse.data));
              
              imageData = {
                imageUrl: generateFullUrl(req, `/uploads/visualizations/${filename}`),
                s3Key: null
              };
            }
          } catch (downloadError) {
            console.error('Error downloading/saving image:', downloadError);
            
            // Still use the direct URL if download/upload failed
            imageData = {
              imageUrl: imageUrl,
              s3Key: null
            };
          }
        }

        // Return the generated image URL
        return res.status(200).json({
          imageUrl: imageData.imageUrl,
          s3Key: imageData.s3Key,
          bucketName: 'ecommerce-website-generated-logo-2025',
          message: 'Clothing visualization generated successfully',
          config: config
        });

      } catch (stabilityError) {
        console.error('Image Generation Error:', {
          message: stabilityError.message,
          stack: stabilityError.stack
        });

        return res.status(500).json({
          message: 'Failed to generate clothing visualization with Stability AI',
          error: stabilityError.message
        });
      }

    } catch (error) {
      console.error('Comprehensive Visualization Error:', {
        message: error.message,
        stack: error.stack
      });

      res.status(500).json({ 
        message: 'Unexpected error generating clothing visualization',
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
  
      // Get user ID from authentication context
      const userId = req.user ? req.user._id : null;
  
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
          userId: userId, // Pass the user ID when saving to database
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
  

  // Get user's logos
  getUserLogos: async (req, res) => {
    try {
      const userId = req.user?._id;
      
      // If user is not authenticated, return unauthorized
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
  
      // Find logos specific to the user
      const logos = await Logo.find({ userId }).sort({ createdAt: -1 });
      
      // Generate pre-signed URLs for each logo
      const logosWithUrls = await Promise.all(logos.map(async (logo) => {
        // If S3 key exists, generate a pre-signed URL with no expiration
        if (logo.s3Key) {
          try {
            const preSignedUrl = await generatePreSignedUrl(
              process.env.AWS_S3_BUCKET, 
              logo.s3Key, 
              0 // Permanent access
            );
            
            return {
              ...logo.toObject(), // Convert Mongoose document to plain object
              url: preSignedUrl
            };
          } catch (urlError) {
            console.error(`Failed to generate URL for logo ${logo._id}:`, urlError);
            return {
              ...logo.toObject(),
              url: logo.imageUrl // Fallback to original URL
            };
          }
        }
        
        // If no S3 key, return original image URL
        return {
          ...logo.toObject(),
          url: logo.imageUrl
        };
      }));
  
      res.status(200).json({ logos: logosWithUrls });
    } catch (error) {
      console.error('Get user logos error:', error);
      res.status(500).json({ 
        message: 'Error retrieving logos',
        error: error.message 
      });
    }
  },

  // Get single logo by ID
  getLogo: async (req, res) => {
    try {
      const logo = await Logo.findById(req.params.id);
      
      if (!logo) {
        return res.status(404).json({ message: 'Logo not found' });
      }

      // Check authorization - only allow access to user's own logos or public logos
      if (logo.userId && req.user?._id.toString() !== logo.userId.toString()) {
        return res.status(403).json({ message: 'Access denied' });
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

  // Delete logo
  deleteLogo: async (req, res) => {
    try {
      const logo = await Logo.findById(req.params.id);
      
      if (!logo) {
        return res.status(404).json({ message: 'Logo not found' });
      }

      // Check authorization - only allow deletion of user's own logos
      if (!logo.userId || req.user?._id.toString() !== logo.userId.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Delete from S3 if we have a key and bucket
      if (logo.s3Key && logo.bucketName) {
        try {
          await s3.deleteObject({
            Bucket: logo.bucketName,
            Key: logo.s3Key
          }).promise();
          
          console.log(`Deleted logo from S3: ${logo.bucketName}/${logo.s3Key}`);
        } catch (s3Error) {
          console.error('Error deleting from S3:', s3Error);
          // Continue with database deletion even if S3 deletion fails
        }
      }

      // Delete from database
      await Logo.findByIdAndDelete(req.params.id);

      res.status(200).json({ 
        message: 'Logo deleted successfully',
        id: req.params.id
      });
    } catch (error) {
      console.error('Delete logo error:', error);
      res.status(500).json({ 
        message: 'Error deleting logo',
        error: error.message 
      });
    }
  },

  // Update logo metadata
  updateLogo: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Find the logo
      const logo = await Logo.findById(id);
      
      if (!logo) {
        return res.status(404).json({ message: 'Logo not found' });
      }

      // Check authorization - only allow updates to user's own logos
      if (!logo.userId || req.user?._id.toString() !== logo.userId.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Update metadata in S3 if key and bucket exist
      if (logo.s3Key && logo.bucketName && updateData.metadata) {
        try {
          // First get existing metadata
          const headResponse = await s3.headObject({
            Bucket: logo.bucketName,
            Key: logo.s3Key
          }).promise();
          
          // Combine existing metadata with updates
          const updatedMetadata = {
            ...headResponse.Metadata,
            ...updateData.metadata,
            'last-modified': new Date().toISOString()
          };
          
          // Copy the object to itself with new metadata
          await s3.copyObject({
            Bucket: logo.bucketName,
            CopySource: `${logo.bucketName}/${logo.s3Key}`,
            Key: logo.s3Key,
            Metadata: updatedMetadata,
            MetadataDirective: 'REPLACE'
          }).promise();
          
          console.log(`Updated metadata for logo in S3: ${logo.bucketName}/${logo.s3Key}`);
        } catch (s3Error) {
          console.error('Error updating metadata in S3:', s3Error);
          // Continue with database update even if S3 update fails
        }
      }

      // Update in database
      const updatedLogo = await Logo.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      );

      res.status(200).json({ 
        message: 'Logo updated successfully', 
        logo: updatedLogo
      });
    } catch (error) {
      console.error('Update logo error:', error);
      res.status(500).json({ 
        message: 'Error updating logo',
        error: error.message 
      });
    }
  }
};

module.exports = logoController;