import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card/Card';
import { Alert, AlertDescription } from '../components/ui/alert/Alert';
import { useFabric } from '../hooks/useFabric';
import { fabricService } from '../services/fabricService';

const Fabric = () => {
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
  const [fabrics, setFabrics] = useState([]);

  // Sample fabric data - replace with API call in production
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
    const newConfig = {
      ...fabricConfig,
      [field]: value
    };
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
        totalPrice: pricing.total
      });
    } catch (err) {
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

    try {
      await fabricService.placeOrder({
        fabricId: selectedFabric.id,
        ...fabricConfig,
        price: orderSummary.totalPrice
      });
      
      // Show success message or redirect to cart
      alert('Added to cart successfully!');
    } catch (err) {
      setError('Failed to add to cart. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading fabrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="m-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Fabric Selection</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Fabric Selection */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              {fabricTypes.map((fabric) => (
                <Card 
                  key={fabric.id}
                  className={`cursor-pointer transition-all ${
                    selectedFabric?.id === fabric.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleFabricSelect(fabric)}
                >
                  <CardContent className="p-4">
                    <img 
                      src={`/api/placeholder/300/200`} 
                      alt={fabric.name}
                      className="w-full h-40 object-cover rounded-lg mb-4"
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
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6">Customize Your Order</h2>
                
                {selectedFabric ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Color</label>
                      <select
                        className="w-full p-2 border rounded"
                        value={fabricConfig.color}
                        onChange={(e) => handleConfigChange('color', e.target.value)}
                      >
                        {selectedFabric.colors.map((color) => (
                          <option key={color} value={color}>
                            {color.charAt(0).toUpperCase() + color.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Style</label>
                      <select
                        className="w-full p-2 border rounded"
                        value={fabricConfig.style}
                        onChange={(e) => handleConfigChange('style', e.target.value)}
                      >
                        {selectedFabric.styles.map((style) => (
                          <option key={style} value={style}>
                            {style.charAt(0).toUpperCase() + style.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Length (meters)
                      </label>
                      <input
                        type="number"
                        min={selectedFabric.minOrder}
                        value={fabricConfig.length}
                        onChange={(e) => handleConfigChange('length', parseInt(e.target.value))}
                        className="w-full p-2 border rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={fabricConfig.quantity}
                        onChange={(e) => handleConfigChange('quantity', parseInt(e.target.value))}
                        className="w-full p-2 border rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Upload Logo
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="w-full"
                      />
                    </div>

                    {orderSummary && (
                      <div className="mt-6 p-4 bg-gray-50 rounded">
                        <h3 className="font-semibold mb-2">Order Summary</h3>
                        <div className="space-y-2 text-sm">
                          <p>Fabric: {orderSummary.fabric}</p>
                          <p>Color: {orderSummary.color}</p>
                          <p>Style: {orderSummary.style}</p>
                          <p>Length: {orderSummary.length} meters</p>
                          <p>Quantity: {orderSummary.quantity}</p>
                          <p className="text-lg font-semibold">
                            Total: ${orderSummary.totalPrice}
                          </p>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>
                      Please select a fabric type to customize your order.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fabric;