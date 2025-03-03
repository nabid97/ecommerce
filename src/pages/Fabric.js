import React, { useState, useEffect } from 'react';
import { AlertDescription } from '../components/ui/alert/Alert';
import { fabricService } from '../services/fabricService';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
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
    //const [fabrics, setFabrics] = useState([]);

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
                // Remove the unnecessary API call
                setError(null);
            } catch (err) {
                console.error('Error fetching fabrics:', err);
                setError('Failed to load fabrics. Please try again.');
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
                totalPrice: pricing.total || 0
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
                fabricId: selectedFabric.id,
                ...fabricConfig,
                price: orderSummary.totalPrice || 0
            });
            
            console.log('Order created:', orderResponse);
            
            const totalItemPrice = orderSummary.totalPrice;
            
            addToCart({
                id: selectedFabric.id,
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
                orderId: orderResponse.orderId
            });
            
            setSuccess('Added to cart successfully!');
        } catch (err) {
            console.error('Error placing order:', err);
            setError('Failed to add to cart. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4" data-testid="loading-state">
                <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="rounded-lg overflow-hidden border border-gray-200">
                                    <div className="h-48 bg-gray-200 animate-pulse"></div>
                                    <div className="p-4 space-y-3">
                                        <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                        <div className="flex justify-between">
                                            <div className="h-5 bg-gray-200 rounded animate-pulse w-1/3"></div>
                                            <div className="h-5 bg-gray-200 rounded animate-pulse w-1/4"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="md:col-span-1">
                        <div className="border border-gray-200 rounded-lg">
                            <div className="h-10 bg-gray-200 animate-pulse rounded-t-lg"></div>
                            <div className="p-4 space-y-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-8 bg-gray-200 rounded animate-pulse"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8" data-testid="fabrics-page">
            <div className="max-w-7xl mx-auto px-4">
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
                    {/* Fabric Selection */}
                    <div className="md:col-span-2" data-testid="fabric-grid">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {fabricTypes.map((fabric) => (
                                <Card 
                                    key={fabric.id}
                                    data-testid={`fabric-card-${fabric.id}`}
                                    className={`${cardInteractions.selectable} ${
                                        selectedFabric?.id === fabric.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                                    }`}
                                    variant="bordered"
                                    onClick={() => handleFabricSelect(fabric)}
                                >
                                    <img 
                                        src={`/fabric-images/${fabric.id.charAt(0).toUpperCase() + fabric.id.slice(1)}.jpg`}
                                        alt={fabric.name}
                                        className="w-full h-48 object-cover rounded-t-lg"
                                        data-testid={`fabric-image-${fabric.id}`}
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
                                            {(fabric.colors || []).slice(0, 4).map((color, index) => (
                                                <div 
                                                    key={index}
                                                    className="w-6 h-6 rounded-full border border-gray-200" 
                                                    style={{ backgroundColor: color }}
                                                    title={color}
                                                ></div>
                                            ))}
                                            {fabric.colors?.length > 4 && (
                                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                                                    +{fabric.colors.length - 4}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-medium">
                                            <span>Available styles:</span>
                                            <span>{fabric.styles.join(', ')}</span>
                                        </div>
                                    </CardContent>
                                    <CardDivider />
                                    <CardFooter variant="flex">
                                        <div className="text-sm text-gray-500">
                                            Min. order: {fabric.minOrder} meters
                                        </div>
                                        <div className="font-bold text-lg text-blue-700">
                                            ${fabric.price}/meter
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
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
                                                    {selectedFabric.colors.map((color) => (
                                                        <option key={color} value={color}>
                                                            {color.charAt(0).toUpperCase() + color.slice(1)}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div 
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border border-gray-300" 
                                                    style={{ backgroundColor: fabricConfig.color }}
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
                                                {selectedFabric.styles.map((style) => (
                                                    <option key={style} value={style}>
                                                        {style.charAt(0).toUpperCase() + style.slice(1)}
                                                    </option>
                                                ))}
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
                                            <p className={`text-sm mt-1 ${fabricConfig.quantity < selectedFabric?.minOrder ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                                                {fabricConfig.quantity < selectedFabric?.minOrder
                                                    ? `Minimum order requirement: ${selectedFabric.minOrder} meters`
                                                    : `Minimum order: ${selectedFabric.minOrder} meters`}
                                            </p>
                                        </div>

                                        {/* Logo Upload */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Add Logo (Optional)</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                data-testid="logo-upload"
                                            />
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
                                        disabled={selectedFabric && fabricConfig.quantity < selectedFabric.minOrder}
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
                        {fabricTypes.slice(0, 4).map((fabric) => (
                            <Card 
                                key={`recent-${fabric.id}`}
                                className={`${cardInteractions.hoverable}`}
                                variant="flat"
                                size="sm"
                                onClick={() => handleFabricSelect(fabric)}
                            >
                                <img 
                                    src={`/fabric-images/${fabric.id.charAt(0).toUpperCase() + fabric.id.slice(1)}.jpg`}
                                    alt={fabric.name}
                                    className="w-full h-24 object-cover rounded-t-lg"
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