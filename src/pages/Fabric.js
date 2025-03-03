// src/pages/Fabric.js - Updated for fetching from database
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '../components/ui/alert/Alert';
import { fabricService } from '../services/fabricService';
import { useCart } from '../contexts/CartContext';
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    CardFooter, 
    CardDivider 
} from '../components/ui/card/Card';
import { cardInteractions } from '../components/ui/card/Card.styles';

const Fabric = () => {
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
    const [filterOptions, setFilterOptions] = useState({
        types: [],
        colors: [],
        styles: []
    });

    useEffect(() => {
        const fetchFabrics = async () => {
            try {
                setLoading(true);
                const response = await fabricService.getFabricTypes();
                
                // Check if response has data structure with fabrics array
                const fabricsData = response.data?.fabrics || response;
                
                if (Array.isArray(fabricsData) && fabricsData.length > 0) {
                    setFabrics(fabricsData);
                    
                    // Extract filter options
                    const types = [...new Set(fabricsData.map(fabric => fabric.type))];
                    
                    // Extract all colors from all fabrics
                    const allColors = fabricsData.reduce((acc, fabric) => {
                        if (Array.isArray(fabric.colors)) {
                            fabric.colors.forEach(color => {
                                if (typeof color === 'object' && color.name) {
                                    acc.push(color.name.toLowerCase());
                                } else if (typeof color === 'string') {
                                    acc.push(color.toLowerCase());
                                }
                            });
                        }
                        return acc;
                    }, []);
                    const uniqueColors = [...new Set(allColors)];
                    
                    // Extract all styles from all fabrics
                    const allStyles = fabricsData.reduce((acc, fabric) => {
                        if (Array.isArray(fabric.availableStyles)) {
                            fabric.availableStyles.forEach(style => {
                                if (typeof style === 'object' && style.name) {
                                    acc.push(style.name.toLowerCase());
                                } else if (typeof style === 'string') {
                                    acc.push(style.toLowerCase());
                                }
                            });
                        }
                        return acc;
                    }, []);
                    const uniqueStyles = [...new Set(allStyles)];
                    
                    setFilterOptions({
                        types,
                        colors: uniqueColors,
                        styles: uniqueStyles
                    });
                } else {
                    throw new Error('No fabrics found or invalid data format');
                }
                
                setError(null);
            } catch (err) {
                console.error('Error fetching fabrics:', err);
                setError('Failed to load fabrics. Please try again.');
                
                // For development fallback
                if (process.env.NODE_ENV === 'development') {
                    const fallbackFabrics = [
                        {
                            id: 'cotton',
                            name: 'Cotton',
                            description: 'Soft, breathable natural fabric',
                            type: 'cotton',
                            minOrderQuantity: 50,
                            price: 5.99,
                            colors: [
                                { name: 'White', code: '#FFFFFF', inStock: true },
                                { name: 'Black', code: '#000000', inStock: true },
                                { name: 'Navy', code: '#000080', inStock: true },
                                { name: 'Grey', code: '#808080', inStock: true }
                            ],
                            availableStyles: [
                                { name: 'Plain', description: 'Simple flat weave' },
                                { name: 'Twill', description: 'Diagonal ribbed texture' },
                                { name: 'Jersey', description: 'Stretchy knit fabric' }
                            ],
                            stock: {
                                available: 1000,
                                reserved: 0,
                                reorderPoint: 200
                            }
                        },
                        // Add more fallback fabrics as needed
                    ];
                    setFabrics(fallbackFabrics);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchFabrics();
    }, []);

    const handleFabricSelect = (fabric) => {
        setSelectedFabric(fabric);
        
        // Default the color to the first available color
        const defaultColor = fabric.colors && fabric.colors.length > 0 
            ? (typeof fabric.colors[0] === 'object' ? fabric.colors[0].name : fabric.colors[0])
            : '';
            
        // Default the style to the first available style
        const defaultStyle = fabric.availableStyles && fabric.availableStyles.length > 0
            ? (typeof fabric.availableStyles[0] === 'object' ? fabric.availableStyles[0].name : fabric.availableStyles[0])
            : '';
        
        setFabricConfig({
            ...fabricConfig,
            type: fabric.id || fabric._id,
            color: defaultColor,
            style: defaultStyle
        });
        
        updateOrderSummary({
            ...fabricConfig,
            type: fabric.id || fabric._id,
            color: defaultColor,
            style: defaultStyle
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
                selectedFabric.id || selectedFabric._id,
                config.length,
                config.quantity
            );

            setOrderSummary({
                fabric: selectedFabric.name,
                color: config.color,
                style: config.style,
                length: config.length,
                quantity: config.quantity,
                totalPrice: pricing.total || pricing.data?.total || 0
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
            const orderResponse = await fabricService.placeOrder({
                fabricId: selectedFabric.id || selectedFabric._id,
                ...fabricConfig,
                price: orderSummary.totalPrice || 0
            });
            
            console.log('Order created:', orderResponse);
            
            const totalItemPrice = orderSummary.totalPrice;
            
            addToCart({
                id: selectedFabric.id || selectedFabric._id,
                name: selectedFabric.name,
                price: totalItemPrice,
                quantity: 1,
                image: selectedFabric.images && selectedFabric.images.length > 0 
                    ? selectedFabric.images[0].url 
                    : null,
                customizations: {
                    color: fabricConfig.color,
                    style: fabricConfig.style,
                    length: fabricConfig.length,
                    quantity: fabricConfig.quantity,
                    logo: fabricConfig.logo
                },
                orderId: orderResponse.orderId || orderResponse._id
            });
            
            setSuccess('Added to cart successfully!');
        } catch (err) {
            console.error('Error placing order:', err);
            setError('Failed to add to cart. Please try again.');
        }
    };

    // Rest of component remains largely the same, but now uses the fabrics array from state
    // instead of hardcoded fabricTypes

    return (
        <div className="min-h-screen bg-gray-50 py-8" data-testid="fabrics-page">
            <div className="max-w-7xl mx-auto px-4">
                {/* Breadcrumbs and page header */}
                <div className="flex items-center text-sm text-gray-500 mb-6">
                    <Link to="/" className="hover:text-blue-600">Home</Link>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="font-medium text-gray-900">Fabric Selection</span>
                    {selectedFabric && (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="font-medium text-gray-900">{selectedFabric.name}</span>
                        </>
                    )}
                </div>

                <h1 className="text-3xl font-bold mb-8">Fabric Selection</h1>

                {/* Error and success alerts */}
                {error && (
                    <Card className="mb-6 border-red-300 bg-red-50" data-testid="error-message">
                        <CardContent className="flex items-start p-4">
                            <div className="flex-shrink-0 mr-2">
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <AlertDescription className="text-red-800">{error}</AlertDescription>
                        </CardContent>
                    </Card>
                )}

                {success && (
                    <Card className="mb-6 border-green-300 bg-green-50">
                        <CardContent className="flex items-start p-4">
                            <div className="flex-shrink-0 mr-2">
                                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <AlertDescription className="text-green-800" data-testid="success-message">{success}</AlertDescription>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Fabric Selection Grid */}
                    <div className="md:col-span-2" data-testid="fabric-grid">
                        {loading ? (
                          // Loading skeleton
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {[1, 2, 3, 4].map(i => (
                              <div key={i} className="rounded-lg overflow-hidden border border-gray-200 animate-pulse">
                                  <div className="h-48 bg-gray-200"></div>
                                  <div className="p-4 space-y-3">
                                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                      <div className="h-4 bg-gray-200 rounded"></div>
                                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                      <div className="flex justify-between">
                                          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                                          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {fabrics.map((fabric) => (
                              <Card 
                                  key={fabric.id || fabric._id}
                                  data-testid={`fabric-card-${fabric.id || fabric._id}`}
                                  className={`${cardInteractions.selectable} ${
                                      selectedFabric?.id === fabric.id || selectedFabric?._id === fabric._id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                                  }`}
                                  variant="bordered"
                                  onClick={() => handleFabricSelect(fabric)}
                              >
                                  <img 
                                      src={fabric.images && fabric.images.length > 0 
                                          ? fabric.images[0].url 
                                          : `/fabric-images/${fabric.name}.jpg`}
                                      alt={fabric.name}
                                      className="w-full h-48 object-cover rounded-t-lg"
                                      data-testid={`fabric-image-${fabric.id || fabric._id}`}
                                      onError={(e) => {
                                          console.log(`Failed to load image: ${e.target.src}`);
                                          e.target.src = `/api/placeholder/300/200?text=${fabric.name}`;
                                      }}
                                  />
                                  <CardHeader variant="transparent">
                                      <CardTitle>{fabric.name}</CardTitle>
                                      <p className="text-gray-600">{fabric.description}</p>
                                  </CardHeader>
                                  <CardContent>
                                      <div className="flex flex-wrap gap-2 mb-3">
                                          {(fabric.colors || []).slice(0, 4).map((color, index) => {
                                              const colorValue = typeof color === 'object' ? color.code : color;
                                              const colorName = typeof color === 'object' ? color.name : color;
                                              return (
                                                  <div 
                                                      key={index}
                                                      className="w-6 h-6 rounded-full border border-gray-200" 
                                                      style={{ backgroundColor: colorValue }}
                                                      title={colorName}
                                                  ></div>
                                              );
                                          })}
                                          {fabric.colors?.length > 4 && (
                                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                                                  +{fabric.colors.length - 4}
                                              </div>
                                          )}
                                      </div>
                                      <div className="flex justify-between items-center text-sm font-medium">
                                          <span>Available styles:</span>
                                          <span>
                                              {fabric.availableStyles ? 
                                                  fabric.availableStyles.map(style => 
                                                      typeof style === 'object' ? style.name : style
                                                  ).join(', ') 
                                                  : 'Standard'}
                                          </span>
                                      </div>
                                  </CardContent>
                                  <CardDivider />
                                  <CardFooter variant="flex">
                                      <div className="text-sm text-gray-500">
                                          Min. order: {fabric.minOrderQuantity} meters
                                      </div>
                                      <div className="font-bold text-lg text-blue-700">
                                          ${fabric.price}/meter
                                      </div>
                                  </CardFooter>
                              </Card>
                          ))}
                      </div>
                  )}
              </div>

              {/* Configuration Panel */}
              <div className="md:col-span-1">
                  {selectedFabric ? (
                      <Card variant="bordered" size="md">
                          <CardHeader variant="primary">
                              <CardTitle className="text-white">Configure Your Order</CardTitle>
                          </CardHeader>
                          <CardContent>
                              <div className="space-y-4">
                                  {/* Color Selection */}
                                  <div>
                                      <label className="block text-sm font-medium mb-2">Color</label>
                                      <div className="relative">
                                          <select
                                              value={fabricConfig.color}
                                              onChange={(e) => handleConfigChange('color', e.target.value)}
                                              className="w-full p-2 pl-10 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                                              data-testid="color-select"
                                          >
                                              {selectedFabric.colors && selectedFabric.colors.map((color, index) => {
                                                  const colorName = typeof color === 'object' ? color.name : color;
                                                  const colorValue = typeof color === 'object' ? color.name : color;
                                                  return (
                                                      <option key={index} value={colorValue}>
                                                          {colorName.charAt(0).toUpperCase() + colorName.slice(1)}
                                                      </option>
                                                  );
                                              })}
                                          </select>
                                          <div 
                                              className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border border-gray-300" 
                                              style={{ 
                                                  backgroundColor: selectedFabric.colors?.find(
                                                      c => (typeof c === 'object' ? c.name : c) === fabricConfig.color
                                                  )?.code || fabricConfig.color
                                              }}
                                          ></div>
                                      </div>
                                  </div>

                                  {/* Style Selection */}
                                  <div>
                                      <label className="block text-sm font-medium mb-2">Style</label>
                                      <select
                                          value={fabricConfig.style}
                                          onChange={(e) => handleConfigChange('style', e.target.value)}
                                          className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                                          data-testid="style-select"
                                      >
                                          {selectedFabric.availableStyles ? 
                                              selectedFabric.availableStyles.map((style, index) => {
                                                  const styleName = typeof style === 'object' ? style.name : style;
                                                  const styleValue = typeof style === 'object' ? style.name : style;
                                                  return (
                                                      <option key={index} value={styleValue}>
                                                          {styleName.charAt(0).toUpperCase() + styleName.slice(1)}
                                                      </option>
                                                  );
                                              })
                                              : (
                                                  <option value="standard">Standard</option>
                                              )
                                          }
                                      </select>
                                  </div>

                                  {/* Length Input */}
                                  <div>
                                      <label className="block text-sm font-medium mb-2">Length (meters)</label>
                                      <div className="flex rounded-md">
                                          <button
                                              type="button"
                                              onClick={() => handleConfigChange('length', Math.max(1, fabricConfig.length - 1))}
                                              className="px-3 py-2 border border-r-0 rounded-l-md bg-gray-100 hover:bg-gray-200"
                                          >
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                              </svg>
                                          </button>
                                          <input
                                              type="number"
                                              min="1"
                                              value={fabricConfig.length}
                                              onChange={(e) => handleConfigChange('length', parseInt(e.target.value) || 1)}
                                              className="w-full p-2 border-y text-center focus:ring-blue-500 focus:border-blue-500"
                                              data-testid="length-input"
                                          />
                                          <button
                                              type="button"
                                              onClick={() => handleConfigChange('length', fabricConfig.length + 1)}
                                              className="px-3 py-2 border border-l-0 rounded-r-md bg-gray-100 hover:bg-gray-200"
                                          >
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                              </svg>
                                          </button>
                                      </div>
                                  </div>

                                  {/* Quantity Input */}
                                  <div>
                                      <label className="block text-sm font-medium mb-2">Quantity</label>
                                      <div className="flex rounded-md">
                                          <button
                                              type="button"
                                              onClick={() => handleConfigChange('quantity', Math.max(1, fabricConfig.quantity - 1))}
                                              className="px-3 py-2 border border-r-0 rounded-l-md bg-gray-100 hover:bg-gray-200"
                                          >
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                              </svg>
                                          </button>
                                          <input
                                              type="number"
                                              min="1"
                                              value={fabricConfig.quantity}
                                              onChange={(e) => handleConfigChange('quantity', parseInt(e.target.value) || 1)}
                                              className="w-full p-2 border-y text-center focus:ring-blue-500 focus:border-blue-500"
                                              data-testid="quantity-input"
                                          />
                                          <button
                                              type="button"
                                              onClick={() => handleConfigChange('quantity', fabricConfig.quantity + 1)}
                                              className="px-3 py-2 border border-l-0 rounded-r-md bg-gray-100 hover:bg-gray-200"
                                          >
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                              </svg>
                                          </button>
                                      </div>
                                      <p className={`text-sm mt-1 ${fabricConfig.quantity < selectedFabric?.minOrderQuantity ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                                          {fabricConfig.quantity < selectedFabric?.minOrderQuantity
                                              ? `Minimum order requirement: ${selectedFabric.minOrderQuantity} meters`
                                              : `Minimum order: ${selectedFabric.minOrderQuantity} meters`}
                                      </p>
                                  </div>
                              </div>
                          </CardContent>
                          
                          {orderSummary && (
                              <>
                                  <CardDivider />
                                  <CardContent>
                                      <h3 className="font-medium mb-2">Order Summary</h3>
                                      <div className="space-y-2">
                                          <div className="flex justify-between">
                                              <span>Fabric</span>
                                              <span>{orderSummary.fabric}</span>
                                          </div>
                                          <div className="flex justify-between">
                                              <span>Color</span>
                                              <span>{orderSummary.color}</span>
                                          </div>
                                          <div className="flex justify-between">
                                              <span>Style</span>
                                              <span>{orderSummary.style}</span>
                                          </div>
                                          <div className="flex justify-between">
                                              <span>Length</span>
                                              <span>{orderSummary.length} meters</span>
                                          </div>
                                          <div className="flex justify-between">
                                              <span>Quantity</span>
                                              <span>{orderSummary.quantity}</span>
                                          </div>
                                          <div className="flex justify-between font-bold pt-2 border-t">
                                              <span>Total Price</span>
                                              <span>${orderSummary.totalPrice.toFixed(2)}</span>
                                          </div>
                                      </div>
                                  </CardContent>
                              </>
                          )}
                          
                          <CardFooter>
                              <button
                                  onClick={handleAddToCart}
                                  disabled={selectedFabric && fabricConfig.quantity < selectedFabric.minOrderQuantity}
                                  className="w-full flex items-center justify-center bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                  data-testid="add-to-cart-button"
                              >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                  Add to Cart
                              </button>
                          </CardFooter>
                      </Card>
                  ) : (
                      <Card variant="bordered" size="md">
                          <CardHeader variant="colored">
                              <CardTitle>Select a Fabric</CardTitle>
                          </CardHeader>
                          <CardContent>
                              <div className="text-center py-6">
                                  <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                  </svg>
                                  <p className="mt-4 text-gray-600">
                                      Please select a fabric from the list to customize your order.
                                  </p>
                              </div>
                          </CardContent>
                      </Card>
                  )}
              </div>
          </div>

          {/* Recently Viewed Section */}
          <div className="mt-12">
              <h2 className="text-xl font-bold mb-4">Recently Viewed</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {fabrics.slice(0, 4).map((fabric) => (
                      <Card 
                          key={`recent-${fabric.id || fabric._id}`}
                          className={`${cardInteractions.hoverable}`}
                          variant="flat"
                          size="sm"
                          onClick={() => handleFabricSelect(fabric)}
                      >
                          <img 
                              src={fabric.images && fabric.images.length > 0 
                                  ? fabric.images[0].url 
                                  : `/fabric-images/${fabric.name}.jpg`}
                              alt={fabric.name}
                              className="w-full h-24 object-cover rounded-t-lg"
                              onError={(e) => {
                                  e.target.src = `/api/placeholder/200/100?text=${fabric.name}`;
                              }}
                          />
                          <CardContent className="p-2">
                              <p className="font-medium text-sm">{fabric.name}</p>
                              <p className="text-blue-600 font-bold text-sm">${fabric.price}/m</p>
                          </CardContent>
                      </Card>
                  ))}
              </div>
          </div>
      </div>
  </div>
);
};

export default Fabric;