const Logo = require('../models/Logo');
const stabilityService = require('../services/stabilityService');
const s3Service = require('../services/s3Service');
const axios = require('axios');

const logoController = {
  // Create Logo (Generate)
  generateLogo: async (req, res) => {
    try {
      console.log('Full Logo Generation Request:', {
        body: req.body,
        headers: req.headers
      });

      const { config } = req.body;

      // Validate input
      if (!config || !config.text) {
        return res.status(400).json({ 
          message: 'Logo text is required',
          receivedBody: req.body 
        });
      }

      // Construct detailed prompt for logo generation
      const logoPrompt = `A professional ${config.style || 'modern'} logo design with text "${config.text}" 
        in ${config.font || 'Arial'} font style. 
        Main color ${config.color || '#000000'}, 
        background color ${config.backgroundColor || '#FFFFFF'}. 
        Clean, minimalist, business-appropriate logo. 
        High resolution, vector-style graphic.`;

      console.log('Stability AI Logo Generation Prompt:', logoPrompt);

      try {
        // Generate logo using Stability AI
        const generatedImage = await stabilityService.generateImage(logoPrompt, {
          size: "1024x1024"
        });

        console.log('Stability AI Generation Response:', generatedImage);

        // Validate image generation
        if (!generatedImage.data || !generatedImage.data[0]?.url) {
          console.error('Invalid Stability AI response:', generatedImage);
          return res.status(500).json({ 
            message: 'Failed to generate logo',
            details: generatedImage 
          });
        }

        // Download image using axios
        const imageResponse = await axios.get(generatedImage.data[0].url, { 
          responseType: 'arraybuffer' 
        });

        // Upload to S3
        const uploadResult = await s3Service.uploadFile({
          buffer: Buffer.from(imageResponse.data),
          originalname: `logo-${Date.now()}.png`,
          mimetype: 'image/png'
        }, 'logos/generated');

        // Create logo record in database
        const logo = new Logo({
          imageUrl: uploadResult.url,
          s3Key: uploadResult.key,
          config: config,
          prompt: logoPrompt,
          type: 'generated',
          status: 'completed'
        });

        await logo.save();

        // Return response
        return res.status(200).json({
          imageUrl: uploadResult.url,
          message: 'Logo generated successfully',
          config: config,
          logoId: logo._id
        });

      } catch (stabilityError) {
        console.error('Stability AI Generation Error:', {
          message: stabilityError.message,
          response: stabilityError.response?.data,
          stack: stabilityError.stack
        });

        return res.status(500).json({
          message: 'Failed to generate logo with Stability AI',
          error: stabilityError.message,
          details: stabilityError.response?.data
        });
      }

    } catch (error) {
      console.error('Comprehensive Logo Generation Error:', {
        message: error.message,
        stack: error.stack,
        fullError: error
      });

      res.status(500).json({ 
        message: 'Unexpected error generating logo',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  },

  // Upload Logo
  uploadLogo: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Upload to S3 or local storage
      const uploadResult = await s3Service.uploadFile(req.file, 'logos/uploaded');

      const logo = new Logo({
        imageUrl: uploadResult.url,
        type: 'uploaded',
        status: 'completed',
        metadata: {
          originalName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype
        }
      });

      await logo.save();

      res.status(200).json({ 
        message: 'Logo uploaded successfully', 
        logo: uploadResult 
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
      const logos = await Logo.find().sort({ createdAt: -1 });
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
      if (logo.s3Key) {
        await s3Service.deleteFile(logo.s3Key);
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