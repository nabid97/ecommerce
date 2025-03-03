import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card/Card';
import { Alert, AlertDescription } from '../components/ui/alert/Alert';
import { fabricService } from '../services/fabricService';
import { useCart } from '../contexts/CartContext'; // Import useCart hook


const Fabric = () => {
  // Get cart functions from context
  const { addToCart } = useCart();
  
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [fabricConfig, setFabricConfig] = useState({
    type: '',
    color: '',
    length: 1,
    style: '',
    quantity: 1,
    logo: null
  });

  const [orderSummary, setOrderSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [fabrics, setFabrics] = useState([]);

  // Sample fabric data
  // Update the fabricTypes array in your Fabric.js component to include the new fabrics:

const fabricTypes = [
  {
    id: 'cotton',
    name: 'Cotton',
    description: 'Soft, breathable natural fabric',
    minOrder: 50,
    price: 5.99,
    colors: ['white', 'black', 'navy', 'grey'],
    styles: ['plain', 'twill', 'jersey']
  },
  {
    id: 'polyester',
    name: 'Polyester',
    description: 'Durable synthetic fabric',
    minOrder: 100,
    price: 4.99,
    colors: ['white', 'black', 'red', 'blue'],
    styles: ['plain', 'satin', 'textured']
  },
  {
    id: 'linen',
    name: 'Linen',
    description: 'Light, natural fabric',
    minOrder: 30,
    price: 8.99,
    colors: ['white', 'beige', 'grey'],
    styles: ['plain', 'textured']
  },
  {
    id: 'silk',
    name: 'Silk',
    description: 'Luxurious, smooth natural fabric',
    minOrder: 20,
    price: 15.99,
    colors: ['white', 'cream', 'black', 'red'],
    styles: ['plain', 'charmeuse', 'satin', 'chiffon']
  },
  {
    id: 'wool',
    name: 'Wool',
    description: 'Warm, insulating natural fabric',
    minOrder: 25,
    price: 12.99,
    colors: ['grey', 'brown', 'navy', 'charcoal'],
    styles: ['plain', 'tweed', 'flannel', 'melton']
  }
];

  useEffect(() => {
    const fetchFabrics = async () => {
      try {
        setLoading(true);
        const response = await fabricService.getFabricTypes();
        setFabrics(response);
        setError(null);
      } catch (err) {
        console.error('Error fetching fabrics:', err);
        setError('Failed to load fabrics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFabrics();
  }, []);

  const handleFabricSelect = (fabric) => {
    setSelectedFabric(fabric);
    setFabricConfig({
      ...fabricConfig,
      type: fabric.id,
      color: fabric.colors[0],
      style: fabric.styles[0]
    });
    updateOrderSummary({
      ...fabricConfig,
      type: fabric.id,
      color: fabric.colors[0],
      style: fabric.styles[0]
    });
  };

  const handleConfigChange = (field, value) => {
    const newConfig = { ...fabricConfig, [field]: value };
    setFabricConfig(newConfig);
    updateOrderSummary(newConfig);
  };

  const updateOrderSummary = async (config) => {
    if (!selectedFabric) return;

    try {
      const pricing = await fabricService.getPricing(
        selectedFabric.id,
        config.length,
        config.quantity
      );

      setOrderSummary({
        fabric: selectedFabric.name,
        color: config.color,
        style: config.style,
        length: config.length,
        quantity: config.quantity,
        totalPrice: pricing.total || 0 // Ensure there's a default value if total is null
      });
    } catch (err) {
      console.error('Error calculating pricing:', err);
      setError('Failed to calculate pricing. Please try again.');
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const uploadedUrl = await fabricService.uploadImage(file);
        handleConfigChange('logo', uploadedUrl);
      } catch (err) {
        setError('Failed to upload logo. Please try again.');
      }
    }
  };

  const handleAddToCart = async () => {
    if (!selectedFabric || !orderSummary) return;
    
    setError('');
    setSuccess('');
    
    try {
      // First create the order on the server
      const orderResponse = await fabricService.placeOrder({
        fabricId: selectedFabric.id,
        ...fabricConfig,
        price: orderSummary.totalPrice || 0
      });
      
      console.log('Order created:', orderResponse);
      
      // Calculate the correct item price (price per unit * length * quantity)
      const totalItemPrice = orderSummary.totalPrice;
      
      // Then add the item to the local cart context with the correct total price
      addToCart({
        id: selectedFabric.id,
        name: selectedFabric.name,
        price: totalItemPrice, // Use the total price from orderSummary
        quantity: 1, // Set to 1 because we're treating this as a single custom item
        image: selectedFabric.images && selectedFabric.images.length > 0 
          ? selectedFabric.images[0].url 
          : null,
        customizations: {
          color: fabricConfig.color,
          style: fabricConfig.style,
          length: fabricConfig.length,
          quantity: fabricConfig.quantity, // Store the fabric quantity as a customization
          logo: fabricConfig.logo
        },
        orderId: orderResponse.orderId // Store the order ID from the API response
      });
      
      // Show success message
      setSuccess('Added to cart successfully!');
      
      // Optional: Reset the form or keep the current selection
      // setSelectedFabric(null);
      // setFabricConfig({ type: '', color: '', length: 1, style: '', quantity: 1, logo: null });
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Failed to add to cart. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64" data-testid="loading-state">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="fabrics-page">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Fabric Selection</h1>

        {error && (
          <Alert className="mb-6" data-testid="error-message">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        
        {success && (
          <Alert className="mb-6 bg-green-50 text-green-900">
            <AlertDescription data-testid="success-message">{success}</AlertDescription>
          </Alert>
        )}


        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Fabric Selection */}
       
<div className="md:col-span-2" data-testid="fabric-grid">
  <div className="grid grid-cols-2 gap-4">
    {fabricTypes.map((fabric) => (
      <Card 
        key={fabric.id}
        data-testid={`fabric-card-${fabric.id}`}
        className={`cursor-pointer transition-all ${
          selectedFabric?.id === fabric.id ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={() => handleFabricSelect(fabric)}
      >
        <CardContent className="p-4">
          {/* Try multiple image paths, prioritizing ones from the API */}

<img 
  src={`/fabric-images/${fabric.id.charAt(0).toUpperCase() + fabric.id.slice(1)}.jpg`}
  alt={fabric.name}
  className="w-full h-40 object-cover rounded-lg mb-4"
  data-testid={`fabric-image-${fabric.id}`}
  onError={(e) => {
    console.log(`Failed to load image: ${e.target.src}`);
    e.target.src = `/api/placeholder/300/200?text=${fabric.name}`;
  }}
/>
          <h3 className="text-xl font-semibold mb-2">{fabric.name}</h3>
          <p className="text-gray-600 mb-2">{fabric.description}</p>
          <p className="text-sm text-gray-500">
            Min. order: {fabric.minOrder} meters
          </p>
          <p className="font-semibold">${fabric.price}/meter</p>
        </CardContent>
      </Card>
    ))}
  </div>
</div>

          {/* Configuration Panel */}
          <div className="md:col-span-1">
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fabric;