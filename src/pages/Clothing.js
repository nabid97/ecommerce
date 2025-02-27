import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card/Card';
import { Alert, AlertDescription } from '../components/ui/alert/Alert';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';

const Clothing = () => {
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [logoUploadedFile, setLogoUploadedFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [generateVisualization, setGenerateVisualization] = useState(false);
  const [imageGenerating, setImageGenerating] = useState(false);
  
  const getPlaceholderTextImage = (text, bgColor = '#f5f5f5', textColor = '#333333', width = 400, height = 320) => {
    // Create a data URL for a placeholder image with text
    // This doesn't rely on any external services
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    
    // Text
    ctx.fillStyle = textColor;
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Handle long text by wrapping or truncating
    const maxWidth = width - 40;
    if (ctx.measureText(text).width > maxWidth) {
      const words = text.split(' ');
      const lines = [];
      let currentLine = words[0];
      
      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
          currentLine += " " + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      
      // Draw each line, centered
      const lineHeight = 30;
      const y = height/2 - ((lines.length - 1) * lineHeight)/2;
      lines.forEach((line, i) => {
        ctx.fillText(line, width/2, y + i * lineHeight);
      });
    } else {
      // Just draw the text centered
      ctx.fillText(text, width/2, height/2);
    }
    
    // Return as data URL
    return canvas.toDataURL('image/png');
  };
  
  // Clean up object URLs when component unmounts or when logoPreview changes
  useEffect(() => {
    return () => {
      // Cleanup function to revoke any object URLs we created
      if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
        console.log("Revoked object URL on unmount");
      }
    };
  }, [logoPreview]);

  const [productConfig, setProductConfig] = useState({
    clothingType: 't-shirt',
    color: 'white',
    size: 'm',
    fabric: 'cotton',
    quantity: 50,
    style: 'casual',
    customDescription: '',
    logoPosition: 'front-center',
    logoSize: 'medium',
    generateImage: false,
    colorSelectionMode: 'preset',
    customColorHex: '#FFFFFF',
    customColor: ''
  });

  const [orderSummary, setOrderSummary] = useState(null);
  
  const clothingTypes = [
    { value: 't-shirt', label: 'T-Shirt' },
    { value: 'polo', label: 'Polo Shirt' },
    { value: 'hoodie', label: 'Hoodie' },
    { value: 'jeans', label: 'Jeans' },
    { value: 'pants', label: 'Pants' },
    { value: 'jacket', label: 'Jacket' },
    { value: 'custom', label: 'Custom (Specify)' }
  ];
  
  const colorOptions = [
    { value: 'white', label: 'White', color: '#FFFFFF' },
    { value: 'black', label: 'Black', color: '#000000' },
    { value: 'navy', label: 'Navy Blue', color: '#000080' },
    { value: 'red', label: 'Red', color: '#FF0000' },
    { value: 'green', label: 'Green', color: '#008000' },
    { value: 'blue', label: 'Blue', color: '#0000FF' },
    { value: 'yellow', label: 'Yellow', color: '#FFFF00' },
    { value: 'purple', label: 'Purple', color: '#800080' },
    { value: 'orange', label: 'Orange', color: '#FFA500' },
    { value: 'pink', label: 'Pink', color: '#FFC0CB' },
    { value: 'brown', label: 'Brown', color: '#8B4513' },
    { value: 'gray', label: 'Gray', color: '#808080' },
    { value: 'custom', label: 'Custom (Specify)', color: '#FFFFFF' }
  ];
  
  const sizeOptions = [
    { value: 'xs', label: 'Extra Small' },
    { value: 's', label: 'Small' },
    { value: 'm', label: 'Medium' },
    { value: 'l', label: 'Large' },
    { value: 'xl', label: 'Extra Large' },
    { value: 'xxl', label: '2XL' },
    { value: 'custom', label: 'Custom Size' }
  ];
  
  const fabricOptions = [
    { value: 'cotton', label: 'Cotton' },
    { value: 'polyester', label: 'Polyester' },
    { value: 'blend', label: 'Cotton-Polyester Blend' },
    { value: 'linen', label: 'Linen' },
    { value: 'denim', label: 'Denim' },
    { value: 'custom', label: 'Custom (Specify)' }
  ];
  
  const styleOptions = [
    { value: 'casual', label: 'Casual' },
    { value: 'business', label: 'Business' },
    { value: 'athletic', label: 'Athletic' },
    { value: 'formal', label: 'Formal' },
    { value: 'vintage', label: 'Vintage' },
    { value: 'custom', label: 'Custom Style' }
  ];
  
  const logoPositionOptions = [
    { value: 'front-center', label: 'Front Center' },
    { value: 'front-left', label: 'Front Left Chest' },
    { value: 'back-center', label: 'Back Center' },
    { value: 'sleeve', label: 'Sleeve' },
    { value: 'custom', label: 'Custom Position' }
  ];
  
  const logoSizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'custom', label: 'Custom Size' }
  ];

  // Handle form input changes
  const handleConfigChange = (field, value) => {
    setProductConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle logo file upload with a direct approach
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      // Validate file
      if (!file.type.match('image.*')) {
        setError('Please select an image file');
        return;
      }
      
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }
      
      console.log("File selected:", file.name, file.type, file.size);
      
      // Store the file for later upload
      setLogoUploadedFile(file);
      
      // Create an object URL for preview (simpler approach than FileReader)
      const objectUrl = URL.createObjectURL(file);
      console.log("Created object URL for preview:", objectUrl);
      setLogoPreview(objectUrl);
    } catch (error) {
      console.error("Logo upload error:", error);
      setError("Failed to process the selected file");
    }
  };

  // Calculate order price
  const calculatePrice = () => {
    // Base prices per clothing type
    const basePrices = {
      't-shirt': 8.99,
      'polo': 12.99,
      'hoodie': 18.99,
      'jeans': 22.99,
      'pants': 19.99,
      'jacket': 25.99,
      'custom': 20.99
    };
    
    // Get base price
    const basePrice = basePrices[productConfig.clothingType] || 15.99;
    
    // Calculate total based on quantity and any additional options
    let total = basePrice * productConfig.quantity;
    
    // Add cost for premium fabrics
    if (['linen', 'denim'].includes(productConfig.fabric)) {
      total *= 1.2; // 20% premium
    }
    
    // Add cost for custom options
    if (productConfig.clothingType === 'custom' || 
        productConfig.color === 'custom' || 
        productConfig.fabric === 'custom') {
      total *= 1.15; // 15% premium for custom work
    }
    
    // Add cost for image generation if selected
    if (productConfig.generateImage) {
      total += 9.99; // Flat fee for AI image generation
    }
    
    return {
      unitPrice: basePrice,
      subtotal: total,
      tax: total * 0.08, // 8% tax
      total: total * 1.08, // Total with tax
    };
  };

  // Generate AI visualization of clothing with logo
  
// Updated generateClothingImage function
const generateClothingImage = async () => {
  setError('');
  setImageGenerating(true);
  
  try {
    // Construct prompt based on product configuration
    const clothingType = productConfig.clothingType === 'custom' ? 
      productConfig.customDescription : productConfig.clothingType;
    
    const color = productConfig.color === 'custom' ? 
      productConfig.customColor : productConfig.color;
    
    const style = productConfig.style === 'custom' ? 
      productConfig.customStyle : productConfig.style;
    
    const fabric = productConfig.fabric === 'custom' ? 
      productConfig.customFabric : productConfig.fabric;
    
    // Build the prompt
    const prompt = `Create a professional product photo of a ${color} ${style} ${clothingType} made of ${fabric} fabric. 
      The garment should have a logo positioned at the ${productConfig.logoPosition} of the ${clothingType}.
      The logo is ${productConfig.logoSize} in size. Clean product photography on white background, highly detailed.`;
      
    console.log("Image generation prompt:", prompt);
    
    try {
      // Try the main visualization endpoint
      const response = await axios.post('http://localhost:5000/api/logos/visualize-clothing', {
        prompt: prompt,
        config: {
          clothingType: productConfig.clothingType,
          color: color,
          style: style,
          fabric: fabric,
          logoPosition: productConfig.logoPosition,
          logoSize: productConfig.logoSize,
          customDescription: productConfig.customDescription || '',
          customColor: productConfig.customColor || '',
          customStyle: productConfig.customStyle || '',
          customFabric: productConfig.customFabric || ''
        }
      });
      
      console.log("Image generation response:", response.data);
      
      if (response.data && response.data.imageUrl) {
        setGeneratedImage(response.data.imageUrl);
        return;
      }
    } catch (mainEndpointError) {
      console.warn("Main endpoint failed:", mainEndpointError);
      throw mainEndpointError;
    }
    
    throw new Error('Failed to generate image');
  } catch (err) {
    console.error('Error generating clothing image:', err);
    
    // Create a local placeholder image
    const placeholderText = `${productConfig.color} ${productConfig.clothingType}`;
    const placeholderImage = getPlaceholderTextImage(placeholderText);
    
    setGeneratedImage(placeholderImage);
    setError('Server error. Using placeholder image instead.');
  } finally {
    setImageGenerating(false);
  }
};

// And then when you use the generated image:
{generatedImage && (
  <div className="bg-white border rounded-lg p-4 flex justify-center">
    <img 
      src={generatedImage} 
      alt="Generated clothing visualization" 
      className="max-w-full max-h-80"
      onError={(e) => {
        console.error('Failed to load generated image');
        
        // Create a fallback image directly when loading fails
        const fallbackImage = getPlaceholderTextImage(
          `${productConfig.color} ${productConfig.clothingType}`,
          '#f5f5f5',
          '#333333'
        );
        
        e.target.src = fallbackImage;
        e.target.alt = 'Image placeholder';
      }}
    />
  </div>
)}

  // Place order
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Calculate price
      const pricingDetails = calculatePrice();
      
      // Define order data
      const orderData = {
        // Use the same structure as your orderController expects
        items: [{
          type: 'clothing',
          productId: productConfig.clothingType,
          quantity: productConfig.quantity,
          price: pricingDetails.unitPrice,
          customizations: {
            size: productConfig.size,
            color: productConfig.color === 'custom' ? productConfig.customColor : productConfig.color,
            fabric: productConfig.fabric === 'custom' ? productConfig.customFabric : productConfig.fabric,
            style: productConfig.style === 'custom' ? productConfig.customStyle : productConfig.style,
            logo: logoPreview ? true : false,
            logoPosition: productConfig.logoPosition,
            logoSize: productConfig.logoSize
          }
        }],
        shippingAddress: {
          // In a real app, you'd get this from a form or user profile
          name: "Customer Name",
          companyName: "Company Name",
          address: "123 Main St",
          city: "City",
          state: "State",
          zipCode: "12345",
          country: "Country",
          phoneNumber: "555-123-4567"
        },
        subtotal: pricingDetails.subtotal,
        tax: pricingDetails.tax,
        shipping: 0, // Free shipping
        total: pricingDetails.total
      };
      
      console.log("Submitting order:", orderData);
      
      // Submit to API
      const response = await axios.post('/api/orders', orderData);
      
      // Add to cart
      addToCart({
        id: Date.now().toString(),
        name: `${productConfig.color} ${productConfig.clothingType} (${productConfig.size.toUpperCase()})`,
        price: pricingDetails.unitPrice,
        quantity: productConfig.quantity,
        image: generatedImage,
        customizations: {
          color: productConfig.color === 'custom' ? productConfig.customColor : productConfig.color,
          size: productConfig.size,
          fabric: productConfig.fabric === 'custom' ? productConfig.customFabric : productConfig.fabric,
          style: productConfig.style === 'custom' ? productConfig.customStyle : productConfig.style,
          logo: logoPreview ? true : false
        }
      });
      
      setSuccess('Your order has been added to the cart!');
      setOrderSummary({
        clothingType: productConfig.clothingType,
        color: productConfig.color === 'custom' ? productConfig.customColor : productConfig.color,
        size: productConfig.size,
        quantity: productConfig.quantity,
        unitPrice: pricingDetails.unitPrice,
        subtotal: pricingDetails.subtotal,
        tax: pricingDetails.tax,
        total: pricingDetails.total,
        orderId: response.data._id || response.data.orderId || Date.now().toString()
      });
      
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Failed to place order. Please try again later.');
      
      // For development: Add to cart even if API fails, to test UI flow
      if (process.env.NODE_ENV !== 'production') {
        const pricingDetails = calculatePrice();
        addToCart({
          id: `dev-${Date.now()}`,
          name: `${productConfig.color} ${productConfig.clothingType} (${productConfig.size.toUpperCase()})`,
          price: pricingDetails.unitPrice,
          quantity: productConfig.quantity,
          image: generatedImage,
          customizations: {
            color: productConfig.color === 'custom' ? productConfig.customColor : productConfig.color,
            size: productConfig.size,
            fabric: productConfig.fabric === 'custom' ? productConfig.customFabric : productConfig.fabric,
            style: productConfig.style === 'custom' ? productConfig.customStyle : productConfig.style,
            logo: logoPreview ? true : false
          }
        });
        setSuccess('Development mode: Item added to cart (API failed)');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Customize Your Clothing</h1>
      
      {error && (
        <Alert className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-6 bg-green-50 text-green-900">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold mb-4">Product Details</h2>
              
              <div className="space-y-4">
                {/* Clothing Type */}
                <div>
                  <label className="block text-sm font-medium mb-1">Clothing Type</label>
                  <select
                    value={productConfig.clothingType}
                    onChange={(e) => handleConfigChange('clothingType', e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    {clothingTypes.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  
                  {productConfig.clothingType === 'custom' && (
                    <input
                      type="text"
                      placeholder="Describe your custom clothing"
                      value={productConfig.customDescription || ''}
                      onChange={(e) => handleConfigChange('customDescription', e.target.value)}
                      className="mt-2 w-full p-2 border rounded"
                    />
                  )}
                </div>
                
                {/* Enhanced Color Selection */}
                <div>
                  <label className="block text-sm font-medium mb-1">Color</label>
                  
                  {/* Color selection mode toggle */}
                  <div className="flex mb-2 border rounded overflow-hidden">
                    <button 
                      onClick={() => setProductConfig({...productConfig, colorSelectionMode: 'preset'})}
                      className={`flex-1 py-1 px-2 text-sm ${productConfig.colorSelectionMode !== 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                    >
                      Preset Colors
                    </button>
                    <button 
                      onClick={() => setProductConfig({...productConfig, colorSelectionMode: 'custom'})}
                      className={`flex-1 py-1 px-2 text-sm ${productConfig.colorSelectionMode === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                    >
                      Custom Color
                    </button>
                  </div>
                  
                  {productConfig.colorSelectionMode !== 'custom' ? (
                    <div>
                      {/* Preset color options */}
                      <div className="grid grid-cols-5 gap-2 mb-2">
                        {[
                          {value: 'white', color: '#FFFFFF', border: true},
                          {value: 'black', color: '#000000'},
                          {value: 'navy', color: '#000080'},
                          {value: 'red', color: '#FF0000'},
                          {value: 'green', color: '#008000'},
                          {value: 'blue', color: '#0000FF'},
                          {value: 'yellow', color: '#FFFF00'},
                          {value: 'purple', color: '#800080'},
                          {value: 'orange', color: '#FFA500'},
                          {value: 'pink', color: '#FFC0CB'},
                          {value: 'brown', color: '#8B4513'},
                          {value: 'gray', color: '#808080'},
                          {value: 'teal', color: '#008080'},
                          {value: 'maroon', color: '#800000'},
                          {value: 'olive', color: '#808000'},
                        ].map(colorOption => (
                          <div 
                            key={colorOption.value}
                            onClick={() => handleConfigChange('color', colorOption.value)}
                            className={`h-8 w-full rounded-md cursor-pointer transition-transform hover:scale-110 ${
                              productConfig.color === colorOption.value ? 'ring-2 ring-blue-500 scale-110' : ''
                            } ${colorOption.border ? 'border border-gray-300' : ''}`}
                            style={{ backgroundColor: colorOption.color }}
                            title={colorOption.value.charAt(0).toUpperCase() + colorOption.value.slice(1)}
                          />
                        ))}
                      </div>
                      
                      <select
                        value={productConfig.color}
                        onChange={(e) => handleConfigChange('color', e.target.value)}
                        className="w-full p-2 border rounded"
                      >
                        {colorOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Custom color picker */}
                      <div className="flex space-x-2">
                        <div className="w-12 h-12 rounded border" style={{ backgroundColor: productConfig.customColorHex || '#FFFFFF' }} />
                        <div className="flex-1">
                          <input
                            type="color"
                            value={productConfig.customColorHex || '#FFFFFF'}
                            onChange={(e) => {
                              const hexColor = e.target.value;
                              setProductConfig({
                                ...productConfig, 
                                customColorHex: hexColor,
                                color: 'custom',
                                customColor: hexColor
                              });
                            }}
                            className="w-full h-12"
                          />
                        </div>
                      </div>
                      
                      {/* Color name input */}
                      <input
                        type="text"
                        placeholder="Color name or description"
                        value={productConfig.customColor || ''}
                        onChange={(e) => handleConfigChange('customColor', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                      
                      {/* Common custom colors */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Quick Custom Colors:</label>
                        <div className="flex flex-wrap gap-1">
                          {[
                            {name: 'Pastel Blue', hex: '#AEC6CF'},
                            {name: 'Mint Green', hex: '#98FB98'},
                            {name: 'Lavender', hex: '#E6E6FA'},
                            {name: 'Coral', hex: '#FF7F50'},
                            {name: 'Slate Gray', hex: '#708090'},
                            {name: 'Peach', hex: '#FFDAB9'},
                            {name: 'Turquoise', hex: '#40E0D0'},
                            {name: 'Crimson', hex: '#DC143C'},
                          ].map(color => (
                            <div 
                              key={color.name}
                              onClick={() => setProductConfig({
                                ...productConfig,
                                customColorHex: color.hex,
                                color: 'custom',
                                customColor: color.name
                              })}
                              className="h-6 w-6 rounded-full cursor-pointer hover:scale-110 transition-transform"
                              style={{ backgroundColor: color.hex }}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Color preview and description */}
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-sm">Selected:</span>
                    <div 
                      className="h-6 w-6 rounded-full border border-gray-300" 
                      style={{ 
                        backgroundColor: productConfig.color === 'custom' 
                          ? productConfig.customColorHex || '#FFFFFF'
                          : colorOptions.find(c => c.value === productConfig.color)?.color || productConfig.color
                      }}
                    />
                    <span className="text-sm">
                      {productConfig.color === 'custom' 
                        ? (productConfig.customColor || 'Custom color') 
                        : colorOptions.find(c => c.value === productConfig.color)?.label || productConfig.color}
                    </span>
                  </div>
                </div>
                
                {/* Size */}
                <div>
                  <label className="block text-sm font-medium mb-1">Size</label>
                  <select
                    value={productConfig.size}
                    onChange={(e) => handleConfigChange('size', e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    {sizeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  
                  {productConfig.size === 'custom' && (
                    <input
                      type="text"
                      placeholder="Describe custom sizing needs"
                      value={productConfig.customSize || ''}
                      onChange={(e) => handleConfigChange('customSize', e.target.value)}
                      className="mt-2 w-full p-2 border rounded"
                    />
                  )}
                </div>
                
                {/* Fabric */}
                <div>
                  <label className="block text-sm font-medium mb-1">Fabric</label>
                  <select
                    value={productConfig.fabric}
                    onChange={(e) => handleConfigChange('fabric', e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    {fabricOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  
                  {productConfig.fabric === 'custom' && (
                    <input
                      type="text"
                      placeholder="Describe the custom fabric"
                      value={productConfig.customFabric || ''}
                      onChange={(e) => handleConfigChange('customFabric', e.target.value)}
                      className="mt-2 w-full p-2 border rounded"
                    />
                  )}
                </div>
                
                {/* Style */}
                <div>
                  <label className="block text-sm font-medium mb-1">Style</label>
                  <select
                    value={productConfig.style}
                    onChange={(e) => handleConfigChange('style', e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    {styleOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  
                  {productConfig.style === 'custom' && (
                    <input
                      type="text"
                      placeholder="Describe the custom style"
                      value={productConfig.customStyle || ''}
                      onChange={(e) => handleConfigChange('customStyle', e.target.value)}
                      className="mt-2 w-full p-2 border rounded"
                    />
                  )}
                </div>
                
                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium mb-1">Order Size (Minimum 50 pieces)</label>
                  <input
                    type="number"
                    min="50"
                    value={productConfig.quantity}
                    onChange={(e) => handleConfigChange('quantity', parseInt(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold mb-4">Logo Options</h2>
              
              <div className="space-y-4">
                {/* Logo Position */}
                <div>
                  <label className="block text-sm font-medium mb-1">Logo Position</label>
                  <select
                    value={productConfig.logoPosition}
                    onChange={(e) => handleConfigChange('logoPosition', e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    {logoPositionOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  
                  {productConfig.logoPosition === 'custom' && (
                    <input
                      type="text"
                      placeholder="Describe the custom position"
                      value={productConfig.customLogoPosition || ''}
                      onChange={(e) => handleConfigChange('customLogoPosition', e.target.value)}
                      className="mt-2 w-full p-2 border rounded"
                    />
                  )}
                </div>
                
                {/* Logo Size */}
                <div>
                  <label className="block text-sm font-medium mb-1">Logo Size</label>
                  <select
                    value={productConfig.logoSize}
                    onChange={(e) => handleConfigChange('logoSize', e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    {logoSizeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  
                  {productConfig.logoSize === 'custom' && (
                    <input
                      type="text"
                      placeholder="Describe the custom size"
                      value={productConfig.customLogoSize || ''}
                      onChange={(e) => handleConfigChange('customLogoSize', e.target.value)}
                      className="mt-2 w-full p-2 border rounded"
                    />
                  )}
                </div>
                
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium mb-1">Upload Logo</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer block">
                      {logoPreview ? (
                        <div className="relative">
                          <div className="border rounded p-4 bg-white">
                            {logoPreview && (
                              <img
                                src={logoPreview}
                                alt="Logo Preview"
                                className="max-h-48 mx-auto object-contain"
                                onLoad={() => console.log("Logo image loaded successfully")}
                                onError={(e) => {
                                  console.error('Failed to load logo preview image');
                                  // Try to use a placeholder instead
                                  e.target.onerror = null; // Prevent infinite error loop
                                  e.target.src = 'https://via.placeholder.com/200x200?text=Logo+Preview+Failed';
                                  setError('Failed to display logo preview');
                                }}
                              />
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setLogoPreview(null);
                              setLogoUploadedFile(null);
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            title="Remove logo"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="mx-auto w-12 h-12 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="text-gray-600">
                            <span className="text-blue-600">Click to upload</span> or drag and drop
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, or SVG (max. 5MB)
                          </p>
                          <p className="text-xs mt-2">
                            <a href="/image-generator" className="text-blue-600 hover:underline">
                              Generate a logo first
                            </a> if you don't have one
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                
                {/* AI Visualization Option */}
                <div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="generate-image"
                      checked={generateVisualization}
                      onChange={(e) => {
                        setGenerateVisualization(e.target.checked);
                        handleConfigChange('generateImage', e.target.checked);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="generate-image" className="ml-2 block text-sm text-gray-900">
                      Generate AI visualization of the clothing with logo
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Our AI will create a realistic preview of your customized clothing with logo
                  </p>
                  
                  {generateVisualization && (
                    <button
                      onClick={generateClothingImage}
                      disabled={imageGenerating || !logoPreview}
                      className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {imageGenerating ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Generating...
                        </div>
                      ) : (
                        'Generate Visualization'
                      )}
                    </button>
                  )}
                  
                  {!logoPreview && generateVisualization && (
                    <p className="text-xs text-red-500 mt-1">
                      Please upload a logo first to generate visualization
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </div>
            ) : (
              'Add to Cart'
            )}
          </button>
        </div>
        
        {/* Preview and Summary Panel */}
        <div className="space-y-6">
          {/* Generated Image Preview */}
          {(generatedImage || logoPreview) && (
            <Card>
              <CardContent>
                <h2 className="text-xl font-semibold mb-4">
                  {generatedImage ? 'AI Visualization' : 'Logo Preview'}
                </h2>
                
                <div className="bg-white border rounded-lg p-4 flex justify-center">
                  {generatedImage ? (
                    <img 
                      src={generatedImage} 
                      alt="Generated clothing visualization" 
                      className="max-w-full max-h-80"
                      onError={(e) => {
                        console.error('Failed to load generated image');
                        e.target.src = '/api/placeholder/400/320';
                        e.target.alt = 'Image could not be loaded';
                      }}
                    />
                  ) : logoPreview ? (
                    <div className="text-center">
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="max-h-48 mx-auto"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Your logo will be placed on the {productConfig.logoPosition} of the {productConfig.clothingType}
                      </p>
                    </div>
                  ) : null}
                </div>
                
                {generatedImage && (
                  <div className="mt-4 flex justify-center">
                    <a 
                      href={generatedImage}
                      download="clothing-visualization.png"
                      className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download Visualization
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Price Estimation */}
          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold mb-4">Price Estimation</h2>
              
              {orderSummary ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{orderSummary.clothingType} ({orderSummary.quantity} pcs)</span>
                    <span>${orderSummary.unitPrice.toFixed(2)} each</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${orderSummary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%)</span>
                    <span>${orderSummary.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>${orderSummary.total.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {(() => {
                    const priceEstimate = calculatePrice();
                    return (
                      <>
                        <div className="flex justify-between">
                          <span>Unit Price</span>
                          <span>${priceEstimate.unitPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Subtotal ({productConfig.quantity} items)</span>
                          <span>${priceEstimate.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax (8%)</span>
                          <span>${priceEstimate.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t">
                          <span>Estimated Total</span>
                          <span>${priceEstimate.total.toFixed(2)}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Product Information */}
          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold mb-4">Product Information</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Quality Information</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    All our clothing is manufactured to the highest standards using premium quality materials. 
                    We ensure ethical manufacturing practices and sustainable production methods.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">Bulk Order Benefits</h3>
                  <ul className="text-sm text-gray-600 mt-1 list-disc list-inside">
                    <li>Consistent quality across all items</li>
                    <li>Professional logo placement</li>
                    <li>Customization options for corporate needs</li>
                    <li>Bulk packaging for easy distribution</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium">Delivery Information</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Bulk orders typically ship within 10-14 business days after confirmation. 
                    Production times may vary based on quantity and customization requirements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Clothing;