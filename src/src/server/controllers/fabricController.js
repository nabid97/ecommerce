const Fabric = require('../models/Fabric');
const s3Service = require('../services/s3Service');

const fabricController = {
  createFabric: async (req, res) => {
    try {
      const fabricData = req.body;
      const images = req.files; // Assuming multiple image uploads

      // Upload images to S3
      const uploadedImages = await Promise.all(
        images.map(image => s3Service.uploadFile(image, 'fabrics'))
      );

      // Format images for fabric document
      const formattedImages = uploadedImages.map((img, index) => ({
        url: img.url,
        alt: fabricData.name,
        isPrimary: index === 0
      }));

      const fabric = new Fabric({
        ...fabricData,
        images: formattedImages
      });

      await fabric.save();
      res.status(201).json(fabric);
    } catch (error) {
      console.error('Create fabric error:', error);
      res.status(500).json({ message: 'Error creating fabric' });
    }
  },

  getAllFabrics: async (req, res) => {
    try {
      const { 
        type, 
        color, 
        minPrice, 
        maxPrice,
        sort = 'createdAt',
        order = 'desc',
        page = 1,
        limit = 10
      } = req.query;

      const query = {};
      
      if (type) query.type = type;
      if (color) query['colors.name'] = color;
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }

      const skip = (page - 1) * limit;
      
      const fabrics = await Fabric.find(query)
        .sort({ [sort]: order === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await Fabric.countDocuments(query);

      res.json({
        fabrics,
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        total
      });
    } catch (error) {
      console.error('Get fabrics error:', error);
      res.status(500).json({ message: 'Error retrieving fabrics' });
    }
  },

  getFabricById: async (req, res) => {
    try {
      const fabric = await Fabric.findById(req.params.id);
      
      if (!fabric) {
        return res.status(404).json({ message: 'Fabric not found' });
      }

      res.json(fabric);
    } catch (error) {
      console.error('Get fabric error:', error);
      res.status(500).json({ message: 'Error retrieving fabric' });
    }
  },

  updateFabric: async (req, res) => {
    try {
      const fabricData = req.body;
      const newImages = req.files; // New images to add

      const fabric = await Fabric.findById(req.params.id);
      
      if (!fabric) {
        return res.status(404).json({ message: 'Fabric not found' });
      }

      // Handle new images if any
      if (newImages && newImages.length > 0) {
        const uploadedImages = await Promise.all(
          newImages.map(image => s3Service.uploadFile(image, 'fabrics'))
        );

        const formattedNewImages = uploadedImages.map(img => ({
          url: img.url,
          alt: fabric.name,
          isPrimary: false
        }));

        fabric.images = [...fabric.images, ...formattedNewImages];
      }

      // Update other fields
      Object.assign(fabric, fabricData);
      await fabric.save();

      res.json(fabric);
    } catch (error) {
      console.error('Update fabric error:', error);
      res.status(500).json({ message: 'Error updating fabric' });
    }
  },

  deleteFabric: async (req, res) => {
    try {
      const fabric = await Fabric.findById(req.params.id);
      
      if (!fabric) {
        return res.status(404).json({ message: 'Fabric not found' });
      }

      // Delete images from S3
      await Promise.all(
        fabric.images.map(image => {
          const key = image.url.split('/').pop();
          return s3Service.deleteFile(`fabrics/${key}`);
        })
      );

      await fabric.remove();
      res.json({ message: 'Fabric deleted successfully' });
    } catch (error) {
      console.error('Delete fabric error:', error);
      res.status(500).json({ message: 'Error deleting fabric' });
    }
  },

  checkAvailability: async (req, res) => {
    try {
      const { fabricId, quantity } = req.query;
      const fabric = await Fabric.findById(fabricId);

      if (!fabric) {
        return res.status(404).json({ message: 'Fabric not found' });
      }

      const isAvailable = fabric.isQuantityAvailable(Number(quantity));
      res.json({
        available: isAvailable,
        remainingQuantity: fabric.availableQuantity,
        requestedQuantity: Number(quantity)
      });
    } catch (error) {
      console.error('Check availability error:', error);
      res.status(500).json({ message: 'Error checking availability' });
    }
  },

  updateStock: async (req, res) => {
    try {
      const { available, reorderPoint } = req.body;
      const fabric = await Fabric.findById(req.params.id);

      if (!fabric) {
        return res.status(404).json({ message: 'Fabric not found' });
      }

      fabric.stock.available = available || fabric.stock.available;
      fabric.stock.reorderPoint = reorderPoint || fabric.stock.reorderPoint;

      await fabric.save();
      res.json(fabric);
    } catch (error) {
      console.error('Update stock error:', error);
      res.status(500).json({ message: 'Error updating stock' });
    }
  }
};

module.exports = fabricController;