import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../components/ui/card/Card';
import { Alert, AlertDescription } from '../components/ui/alert/Alert';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';
import * as THREE from 'three';

// Helper function for Three.js visualization
const ClothingVisualizer = ({ 
  clothingType, 
  color, 
  logoImage, 
  logoPosition, 
  logoSize 
}) => {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    setIsLoading(true);
    
    // Get the container dimensions
    const width = containerRef.current.clientWidth;
    const height = width * 0.8; // Maintain aspect ratio
    
    // 1. Initialize Three.js renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    
    // 2. Create scene and camera
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 0.1, 1000);
    camera.position.z = 10;
    
    // 3. Create basic clothing shape
    const clothingPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(width * 0.8, height * 0.7),
      new THREE.MeshBasicMaterial({ 
        color: getHexFromColorName(color || 'white'),
        transparent: true
      })
    );
    scene.add(clothingPlane);
    
    // 4. Add clothing type text
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(clothingType, canvas.width/2, canvas.height/2);
    
    const textTexture = new THREE.CanvasTexture(canvas);
    const textPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(width * 0.6, height * 0.2),
      new THREE.MeshBasicMaterial({ 
        map: textTexture,
        transparent: true
      })
    );
    textPlane.position.set(0, -height/3, 0.1);
    scene.add(textPlane);
    
    // 5. Add logo if available
    if (logoImage) {
      // Create a texture from the logoImage URL
      const logoTextureLoader = new THREE.TextureLoader();
      
      // Convert logo position to coordinates
      const logoCoordinates = getLogoCoordinates(logoPosition, width, height);
      const logoScale = getLogoScale(logoSize, width);
      
      logoTextureLoader.load(logoImage, logoTexture => {
        // Calculate aspect ratio to maintain logo proportions
        const logoAspect = logoTexture.image.width / logoTexture.image.height;
        
        // Create logo plane with proper proportions
        const logoWidth = logoScale;
        const logoHeight = logoScale / logoAspect;
        
        const logoPlane = new THREE.Mesh(
          new THREE.PlaneGeometry(logoWidth, logoHeight),
          new THREE.MeshBasicMaterial({ 
            map: logoTexture,
            transparent: true
          })
        );
        
        // Position the logo
        logoPlane.position.set(
          logoCoordinates.x, 
          logoCoordinates.y, 
          0.2 // Slightly in front of clothing
        );
        
        scene.add(logoPlane);
        
        // Render the scene
        renderer.render(scene, camera);
        setIsLoading(false);
      }, undefined, (error) => {
        console.error('Error loading logo texture:', error);
        renderer.render(scene, camera);
        setIsLoading(false);
      });
    } else {
      // Render without logo
      renderer.render(scene, camera);
      setIsLoading(false);
    }
    
    // Handle resizing
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = newWidth * 0.8;
      
      renderer.setSize(newWidth, newHeight);
      camera.left = -newWidth / 2;
      camera.right = newWidth / 2;
      camera.top = newHeight / 2;
      camera.bottom = -newHeight / 2;
      camera.updateProjectionMatrix();
      
      renderer.render(scene, camera);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [clothingType, color, logoImage, logoPosition, logoSize]);
  
  return (
    <div className="relative">
      <div ref={containerRef} className="w-full h-64 bg-white rounded shadow-sm"/>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
};

// Helper functions for the visualization
const getHexFromColorName = (colorName) => {
  const colorMap = {
    'white': '#FFFFFF',
    'black': '#000000',
    'red': '#FF0000',
    'blue': '#0000FF',
    'navy': '#000080',
    'green': '#008000',
    'yellow': '#FFFF00',
    'purple': '#800080',
    'gray': '#808080',
    'orange': '#FFA500',
    'pink': '#FFC0CB',
    'brown': '#8B4513'
  };
  
  return colorMap[colorName] || (colorName.startsWith('#') ? colorName : '#FFFFFF');
};

const getLogoCoordinates = (position, width, height) => {
  // Convert logo position strings to x,y coordinates
  const positionMap = {
    'front-center': { x: 0, y: 0 },
    'front-left': { x: -width/4, y: 0 },
    'back-center': { x: 0, y: -height/6 },
    'sleeve': { x: width/3, y: 0 }
  };
  
  return positionMap[position] || positionMap['front-center'];
};

const getLogoScale = (size, containerWidth) => {
  const scales = {
    'small': containerWidth * 0.15,
    'medium': containerWidth * 0.25,
    'large': containerWidth * 0.35
  };
  
  return scales[size] || scales.medium;
};

// Main Clothing component
const Clothing = () => {
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [generateVisualization, setGenerateVisualization] = useState(false);
  const [imageGenerating, setImageGenerating] = useState(false);
  
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

  // Handle logo file upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      // Reset previous error state if any
      setError('');
      
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
      
      // Clean up any previous object URL before creating a new one
      if (logoPreview && logoPreview.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(logoPreview);
          console.log("Revoked previous object URL");
        } catch (revokeError) {
          console.warn("Failed to revoke previous URL:", revokeError);
        }
      }
      
      // Store the file for later upload
      setLogoFile(file);
      
      // Create a new object URL for preview
      try {
        const objectUrl = URL.createObjectURL(file);
        console.log("Created new object URL for preview:", objectUrl);
        setLogoPreview(objectUrl);
        
        // Also automatically update visualization state if needed
        if (!generateVisualization) {
          setGenerateVisualization(true);
        }
      } catch (urlError) {
        console.error("Failed to create object URL:", urlError);
        setError("Failed to create preview. Please try again.");
      }
    } catch (error) {
      console.error("Logo upload error:", error);
      setError("Failed to process the selected file");
    }
  };
  
  // Also add this useEffect to clean up object URLs on unmount:
  useEffect(() => {
    return () => {
      // Clean up function to revoke object URLs when component unmounts
      if (logoPreview && logoPreview.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(logoPreview);
          console.log("Revoked object URL on component unmount");
        } catch (error) {
          console.warn("Error revoking URL on unmount:", error);
        }
      }
    };
  }, [logoPreview]);

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
    
    return {
      unitPrice: basePrice,
      subtotal: total,
      tax: total * 0.08, // 8% tax
      total: total * 1.08, // Total with tax
    };
  };

  // Generate 3D visualization of clothing with logo
  const generateClothingImage = async () => {
    setError('');
    setImageGenerating(true);
    
    try {
      // Simply set the flag to show the 3D visualization
      setGenerateVisualization(true);
      setImageGenerating(false);
    } catch (err) {
      console.error('Error generating clothing visualization:', err);
      setError('Error generating visualization. Please try again.');
      setImageGenerating(false);
    }
  };

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
      
      // Submit to API - use full URL to ensure correct server
      const response = await axios.post('http://localhost:5000/api/orders', orderData);
      
      // Add to cart
      addToCart({
        id: Date.now().toString(),
        name: `${productConfig.color} ${productConfig.clothingType} (${productConfig.size.toUpperCase()})`,
        price: pricingDetails.unitPrice,
        quantity: productConfig.quantity,
        image: null, // We don't have an image URL from 3D visualization
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
          image: null,
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
                                  e.target.onerror = null; // Prevent infinite error loop
                                  e.target.alt = 'Failed to load logo';
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
                              setLogoFile(null);
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
                Generate visualization of the clothing with logo
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Our visualization engine will create a preview of your customized clothing with logo
            </p>
            
            {/* Replace the button with this more reliable version */}
            <button
              onClick={() => {
                setImageGenerating(true);
                // Force set visualization to true and trigger a re-render
                setGenerateVisualization(true);
                setTimeout(() => {
                  setImageGenerating(false);
                }, 500); // Add a slight delay to make the loading state visible
              }}
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
            
            {/* Keep this part as is */}
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
         
         {/* Simplified Visualization that will appear immediately */}
{generateVisualization && logoPreview && (
  <Card>
    <CardContent>
      <h2 className="text-xl font-semibold mb-4">
        Clothing Visualization
      </h2>
      
      <div className="bg-white border rounded-lg p-4">
        {/* Simple visualization that will work reliably */}
        <div className="relative">
          {/* Basic clothing shape based on type */}
          <div 
            className="w-full aspect-[3/4] rounded flex items-center justify-center"
            style={{ 
              backgroundColor: 
                productConfig.color === 'custom' 
                  ? productConfig.customColorHex || '#FFFFFF'
                  : productConfig.color
            }}
          >
            {/* Text showing the clothing type */}
            <div className="text-xl font-bold opacity-20">
              {productConfig.clothingType.toUpperCase()}
            </div>
            
            {/* Logo overlay */}
            {logoPreview && (
              <div 
                className={`absolute ${
                  productConfig.logoPosition === 'front-center' ? 'top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2' :
                  productConfig.logoPosition === 'front-left' ? 'top-1/3 left-1/4 transform -translate-x-1/2 -translate-y-1/2' :
                  productConfig.logoPosition === 'back-center' ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' :
                  'top-1/3 right-1/4 transform translate-x-1/2 -translate-y-1/2' /* sleeve */
                }`}
              >
                <img 
                  src={logoPreview} 
                  alt="Your Logo" 
                  className={`
                    ${productConfig.logoSize === 'small' ? 'w-16 h-16' : 
                      productConfig.logoSize === 'medium' ? 'w-24 h-24' : 
                      'w-32 h-32'}
                    object-contain
                  `}
                  onError={(e) => {
                    console.error('Failed to load logo in visualization');
                    e.target.src = '/api/placeholder/100/100?text=Logo+Error';
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Visualization of your {productConfig.color} {productConfig.clothingType} with logo
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Actual product may vary slightly from visualization
        </p>
      </div>
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