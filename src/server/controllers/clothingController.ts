// src/server/controllers/clothingController.ts
import { Request, Response } from 'express';
import stabilityService from '../services/stabilityService';
import s3Service from '../services/s3Service';
import Order from '../models/Order';
import axios from 'axios';
import path from 'path';
import fs from 'fs';

// Define interfaces for the clothing controller
interface ClothingConfig {
  clothingType: string;
  customDescription?: string;
  color: string;
  customColor?: string;
  style: string;
  customStyle?: string;
  fabric: string;
  customFabric?: string;
  logoPosition: string;
  customLogoPosition?: string;
  logoSize: string;
  customLogoSize?: string;
  [key: string]: any;
}

interface ClothingOrderRequest {
  clothingType: string;
  color: string;
  size: string; 
  fabric: string;
  quantity: number;
  style: string;
  logoPosition: string;
  logoSize: string;
  pricing: {
    unitPrice?: number;
    subtotal?: number;
    tax?: number;
    total?: number;
  };
  logoImageUrl?: string;
  generatedVisualization?: string;
}

interface AuthRequest extends Request {
  user?: {
    _id: string;
    [key: string]: any;
  };
}

interface ClothingType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  minOrder: number;
  availableColors: string[];
  fabricOptions: string[];
}

interface ClothingControllerInterface {
  generateVisualization: (req: Request, res: Response) => Promise<void>;
  createOrder: (req: AuthRequest, res: Response) => Promise<void>;
  getClothingTypes: (req: Request, res: Response) => Promise<void>;
}

const clothingController: ClothingControllerInterface = {
  // Generate clothing visualization
  generateVisualization: async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('\n====== CLOTHING VISUALIZATION REQUEST ======');
      console.log('Request Body:', JSON.stringify(req.body, null, 2));
      
      const { config } = req.body;
      
      // Validate request
      if (!config || !config.clothingType) {
        res.status(400).json({ 
          message: 'Clothing configuration is required',
          receivedBody: req.body 
        });
        return;
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
      const prompt = `Create a professional product photo of a ${color} ${style} ${clothingType} made of ${fabric} fabric. 
        The garment should have a logo positioned at the ${logoPosition} of the ${clothingType}.
        The logo is ${logoSize} in size. Clean product photography on white background, highly detailed, 
        professional lighting, 8k resolution, product visualization.`;

      console.log('Clothing Visualization Prompt:', prompt);

      try {
        // Generate image using Stability AI
        const generatedImage = await stabilityService.generateImage(prompt, {
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
          res.status(500).json({ 
            message: 'Failed to generate clothing visualization',
            details: 'Invalid response from image generation service'
          });
          return;
        }

        let imageUrl = generatedImage.data[0].url;
        let imageData: {
          imageUrl: string;
          s3Key: string | null;
        };
        
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
            if (process.env.AWS_S3_BUCKET && s3Service.uploadFile) {
              const uploadResult = await s3Service.uploadFile({
                buffer: Buffer.from(imageResponse.data),
                originalname: `clothing-${config.clothingType}-${Date.now()}.png`,
                mimetype: 'image/png'
              } as Express.Multer.File, 'visualizations/clothing');

              imageData = {
                imageUrl: uploadResult.url,
                s3Key: uploadResult.key
              };
            } else {
              // Save locally if S3 is not configured
              const uploadsDir = path.join(__dirname, '../../uploads/visualizations');
              if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
              }
              
              const filename = `clothing-${config.clothingType}-${Date.now()}.png`;
              const filePath = path.join(uploadsDir, filename);
              fs.writeFileSync(filePath, Buffer.from(imageResponse.data));
              
              imageData = {
                imageUrl: `/uploads/visualizations/${filename}`,
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
        res.status(200).json({
          imageUrl: imageData.imageUrl,
          message: 'Clothing visualization generated successfully',
          config: config
        });

      } catch (stabilityError) {
        console.error('Image Generation Error:', {
          message: (stabilityError as Error).message,
          stack: (stabilityError as Error).stack
        });

        res.status(500).json({
          message: 'Failed to generate clothing visualization with Stability AI',
          error: (stabilityError as Error).message
        });
      }

    } catch (error) {
      console.error('Comprehensive Visualization Error:', {
        message: (error as Error).message,
        stack: (error as Error).stack
      });

      res.status(500).json({ 
        message: 'Unexpected error generating clothing visualization',
        error: (error as Error).message
      });
    }
  },

  // Create clothing order
  createOrder: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      console.log('\n====== CLOTHING ORDER REQUEST ======');
      console.log('Request Body:', JSON.stringify(req.body, null, 2));
      
      const { 
        clothingType, 
        color, 
        size, 
        fabric, 
        quantity, 
        style, 
        logoPosition, 
        logoSize, 
        pricing, 
        logoImageUrl, 
        generatedVisualization 
      }: ClothingOrderRequest = req.body;
      
      // Validate request
      if (!clothingType || !quantity || quantity < 50) {
        res.status(400).json({ 
          message: 'Invalid order request. Clothing type and minimum quantity of 50 required.',
          receivedBody: req.body 
        });
        return;
      }
      
      // Create an order object
      const order = new Order({
        userId: req.user ? req.user._id : null,
        items: [{
          type: 'clothing',
          productId: clothingType, // Using clothingType as productId for simplicity
          quantity: quantity,
          price: pricing.unitPrice || 10, // Fallback price if not provided
          customizations: {
            size: size,
            color: color,
            fabric: fabric,
            style: style,
            logo: logoImageUrl ? true : false,
            logoPosition: logoPosition,
            logoSize: logoSize
          }
        }],
        status: 'pending',
        subtotal: pricing.subtotal || (quantity * 10),
        tax: pricing.tax || ((quantity * 10) * 0.08),
        shipping: 0, // Free shipping
        total: pricing.total || ((quantity * 10) * 1.08),
        notes: `AI visualization: ${generatedVisualization ? 'Yes' : 'No'}`
      });
      
      // Add mock data for development
      if (process.env.NODE_ENV !== 'production') {
        // Send response with mock order ID
        res.status(201).json({
          message: 'Order created successfully',
          orderId: `ORDER-${Date.now()}`,
          status: 'pending',
          total: pricing.total || ((quantity * 10) * 1.08)
        });
        return;
      }
      
      // Save the order to database
      await order.save();
      
      res.status(201).json({
        message: 'Order created successfully',
        orderId: order._id,
        status: order.status,
        total: order.total
      });
      
    } catch (error) {
      console.error('Order Creation Error:', {
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      
      res.status(500).json({
        message: 'Failed to create clothing order',
        error: (error as Error).message
      });
    }
  },
  
  // Get available clothing types
  getClothingTypes: async (req: Request, res: Response): Promise<void> => {
    try {
      // For development, return some sample clothing types
      const clothingTypes: ClothingType[] = [
        {
          id: 't-shirt',
          name: 'T-Shirt',
          description: 'Classic comfortable t-shirt',
          basePrice: 8.99,
          minOrder: 50,
          availableColors: ['white', 'black', 'navy', 'red', 'green'],
          fabricOptions: ['cotton', 'polyester', 'blend']
        },
        {
          id: 'polo',
          name: 'Polo Shirt',
          description: 'Professional polo shirt',
          basePrice: 12.99,
          minOrder: 50,
          availableColors: ['white', 'black', 'navy', 'red'],
          fabricOptions: ['cotton', 'polyester']
        },
        {
          id: 'hoodie',
          name: 'Hoodie',
          description: 'Warm and comfortable hoodie',
          basePrice: 18.99,
          minOrder: 50,
          availableColors: ['black', 'navy', 'gray', 'maroon'],
          fabricOptions: ['cotton', 'blend']
        },
        {
          id: 'jeans',
          name: 'Jeans',
          description: 'Durable denim jeans',
          basePrice: 22.99,
          minOrder: 50,
          availableColors: ['blue', 'black', 'gray'],
          fabricOptions: ['denim']
        },
        {
          id: 'pants',
          name: 'Dress Pants',
          description: 'Professional dress pants',
          basePrice: 19.99,
          minOrder: 50,
          availableColors: ['black', 'navy', 'gray', 'khaki'],
          fabricOptions: ['cotton', 'polyester', 'blend']
        },
        {
          id: 'jacket',
          name: 'Jacket',
          description: 'Professional jacket',
          basePrice: 25.99,
          minOrder: 50,
          availableColors: ['black', 'navy', 'gray'],
          fabricOptions: ['polyester', 'blend']
        }
      ];
      
      res.status(200).json(clothingTypes);
    } catch (error) {
      console.error('Get Clothing Types Error:', error);
      res.status(500).json({
        message: 'Failed to retrieve clothing types',
        error: (error as Error).message
      });
    }
  }
};

export default clothingController;