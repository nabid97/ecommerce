const Logo = require('../models/Logo');
const deepseekService = require('../services/deepseekService');
const s3Service = require('../services/s3Service');

const logoController = {
  generateLogo: async (req, res) => {
    try {
      const { prompt, config } = req.body;

      // Generate image using DeepSeek
      const generatedImage = await deepseekService.generateImage(prompt, {
        size: config.size || "1024x1024",
        style: config.style || "modern"
      });

      if (!generatedImage.data || !generatedImage.data[0]?.url) {
        throw new Error('Failed to generate image');
      }

      // Download the image and upload to S3
      const imageUrl = generatedImage.data[0].url;
      const uploadResult = await s3Service.uploadFile({
        buffer: Buffer.from(imageUrl),
        originalname: `${Date.now()}-generated-logo.png`,
        mimetype: 'image/png'
      }, 'logos/generated');

      // Create logo record
      const logo = new Logo({
        userId: req.user._id,
        imageUrl: uploadResult.url,
        s3Key: uploadResult.key,
        config,
        prompt,
        type: 'generated',
        status: 'completed'
      });

      await logo.save();

      res.json({
        logo,
        imageUrl: uploadResult.url
      });
    } catch (error) {
      console.error('Logo generation error:', error);
      res.status(500).json({ message: 'Error generating logo' });
    }
  },

  uploadLogo: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Upload to S3
      const uploadResult = await s3Service.uploadFile(req.file, 'logos/uploaded');

      // Create logo record
      const logo = new Logo({
        userId: req.user._id,
        imageUrl: uploadResult.url,
        s3Key: uploadResult.key,
        type: 'uploaded',
        status: 'completed',
        metadata: {
          originalName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype
        }
      });

      await logo.save();

      res.json({
        logo,
        imageUrl: uploadResult.url
      });
    } catch (error) {
      console.error('Logo upload error:', error);
      res.status(500).json({ message: 'Error uploading logo' });
    }
  },

  getLogo: async (req, res) => {
    try {
      const logo = await Logo.findOne({
        _id: req.params.id,
        userId: req.user._id
      });

      if (!logo) {
        return res.status(404).json({ message: 'Logo not found' });
      }

      res.json(logo);
    } catch (error) {
      console.error('Get logo error:', error);
      res.status(500).json({ message: 'Error retrieving logo' });
    }
  },

  getUserLogos: async (req, res) => {
    try {
      const logos = await Logo.find({
        userId: req.user._id
      }).sort({ createdAt: -1 });

      res.json(logos);
    } catch (error) {
      console.error('Get user logos error:', error);
      res.status(500).json({ message: 'Error retrieving logos' });
    }
  },

  deleteLogo: async (req, res) => {
    try {
      const logo = await Logo.findOne({
        _id: req.params.id,
        userId: req.user._id
      });

      if (!logo) {
        return res.status(404).json({ message: 'Logo not found' });
      }

      // Delete from S3
      await s3Service.deleteFile(logo.s3Key);

      // Delete from database
      await logo.remove();

      res.json({ message: 'Logo deleted successfully' });
    } catch (error) {
      console.error('Delete logo error:', error);
      res.status(500).json({ message: 'Error deleting logo' });
    }
  },

  updateLogo: async (req, res) => {
    try {
      const { config } = req.body;

      const logo = await Logo.findOne({
        _id: req.params.id,
        userId: req.user._id
      });

      if (!logo) {
        return res.status(404).json({ message: 'Logo not found' });
      }

      logo.config = { ...logo.config, ...config };
      await logo.save();

      res.json(logo);
    } catch (error) {
      console.error('Update logo error:', error);
      res.status(500).json({ message: 'Error updating logo' });
    }
  }
};

module.exports = logoController;