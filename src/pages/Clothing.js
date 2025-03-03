import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDivider } from '../components/ui/card/Card';
import { Alert, AlertDescription } from '../components/ui/alert/Alert';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';
import * as THREE from 'three';
import { cardInteractions } from '../components/ui/card/Card.styles';

// ClothingVisualizer remains unchanged for brevity
const ClothingVisualizer = ({ clothingType, color, logoImage, logoPosition, logoSize }) => {
    const containerRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!containerRef.current) return;
        setIsLoading(true);
        
        const width = containerRef.current.clientWidth;
        const height = width * 0.8;
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(renderer.domElement);
        
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 0.1, 1000);
        camera.position.z = 10;
        
        const clothingPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(width * 0.8, height * 0.7),
            new THREE.MeshBasicMaterial({ color: getHexFromColorName(color || 'white'), transparent: true })
        );
        scene.add(clothingPlane);
        
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
            new THREE.MeshBasicMaterial({ map: textTexture, transparent: true })
        );
        textPlane.position.set(0, -height/3, 0.1);
        scene.add(textPlane);
        
        if (logoImage) {
            const logoTextureLoader = new THREE.TextureLoader();
            const logoCoordinates = getLogoCoordinates(logoPosition, width, height);
            const logoScale = getLogoScale(logoSize, width);
            
            logoTextureLoader.load(logoImage, logoTexture => {
                const logoAspect = logoTexture.image.width / logoTexture.image.height;
                const logoWidth = logoScale;
                const logoHeight = logoScale / logoAspect;
                
                const logoPlane = new THREE.Mesh(
                    new THREE.PlaneGeometry(logoWidth, logoHeight),
                    new THREE.MeshBasicMaterial({ map: logoTexture, transparent: true })
                );
                logoPlane.position.set(logoCoordinates.x, logoCoordinates.y, 0.2);
                scene.add(logoPlane);
                renderer.render(scene, camera);
                setIsLoading(false);
            }, undefined, (error) => {
                console.error('Error loading logo texture:', error);
                renderer.render(scene, camera);
                setIsLoading(false);
            });
        } else {
            renderer.render(scene, camera);
            setIsLoading(false);
        }
        
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

// Helper functions unchanged
const getHexFromColorName = (colorName) => {
    const colorMap = {
        'white': '#FFFFFF', 'black': '#000000', 'red': '#FF0000', 'blue': '#0000FF',
        'navy': '#000080', 'green': '#008000', 'yellow': '#FFFF00', 'purple': '#800080',
        'gray': '#808080', 'orange': '#FFA500', 'pink': '#FFC0CB', 'brown': '#8B4513'
    };
    return colorMap[colorName] || (colorName.startsWith('#') ? colorName : '#FFFFFF');
};

const getLogoCoordinates = (position, width, height) => {
    const positionMap = {
        'front-center': { x: 0, y: 0 },
        'front-left': { x: -width/4, y: 0 },
        'back-center': { x: 0, y: -height/6 },
        'sleeve': { x: width/3, y: 0 }
    };
    return positionMap[position] || positionMap['front-center'];
};

const getLogoScale = (size, containerWidth) => {
    const scales = { 'small': containerWidth * 0.15, 'medium': containerWidth * 0.25, 'large': containerWidth * 0.35 };
    return scales[size] || scales.medium;
};

const Clothing = () => {
    const { addToCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [generateVisualization, setGenerateVisualization] = useState(false);

    useEffect(() => {
        return () => {
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
        { value: 't-shirt', label: 'T-Shirt' }, { value: 'polo', label: 'Polo Shirt' },
        { value: 'hoodie', label: 'Hoodie' }, { value: 'jeans', label: 'Jeans' },
        { value: 'pants', label: 'Pants' }, { value: 'jacket', label: 'Jacket' },
        { value: 'custom', label: 'Custom (Specify)' }
    ];

    const presetColors = [
        { value: 'white', label: 'White', color: '#FFFFFF' }, { value: 'black', label: 'Black', color: '#000000' },
        { value: 'navy', label: 'Navy', color: '#000080' }, { value: 'red', label: 'Red', color: '#FF0000' },
        { value: 'green', label: 'Green', color: '#008000' }, { value: 'blue', label: 'Blue', color: '#0000FF' },
        { value: 'yellow', label: 'Yellow', color: '#FFFF00' }, { value: 'purple', label: 'Purple', color: '#800080' },
        { value: 'orange', label: 'Orange', color: '#FFA500' }, { value: 'pink', label: 'Pink', color: '#FFC0CB' },
        { value: 'brown', label: 'Brown', color: '#8B4513' }, { value: 'gray', label: 'Gray', color: '#808080' },
        { value: 'teal', label: 'Teal', color: '#008080' }, { value: 'maroon', label: 'Maroon', color: '#800000' },
        { value: 'olive', label: 'Olive', color: '#808000' }
    ];

    const customColors = [
        { name: 'Pastel Blue', hex: '#AEC6CF' }, { name: 'Mint Green', hex: '#98FB98' },
        { name: 'Lavender', hex: '#E6E6FA' }, { name: 'Coral', hex: '#FF7F50' },
        { name: 'Slate Gray', hex: '#708090' }, { name: 'Peach', hex: '#FFDAB9' },
        { name: 'Turquoise', hex: '#40E0D0' }, { name: 'Crimson', hex: '#DC143C' }
    ];

    const sizeOptions = [
        { value: 'xs', label: 'Extra Small' }, { value: 's', label: 'Small' },
        { value: 'm', label: 'Medium' }, { value: 'l', label: 'Large' },
        { value: 'xl', label: 'Extra Large' }, { value: 'xxl', label: '2XL' },
        { value: 'custom', label: 'Custom Size' }
    ];

    const fabricOptions = [
        { value: 'cotton', label: 'Cotton' }, { value: 'polyester', label: 'Polyester' },
        { value: 'blend', label: 'Cotton-Polyester Blend' }, { value: 'linen', label: 'Linen' },
        { value: 'denim', label: 'Denim' }, { value: 'custom', label: 'Custom (Specify)' }
    ];

    const styleOptions = [
        { value: 'casual', label: 'Casual' }, { value: 'business', label: 'Business' },
        { value: 'athletic', label: 'Athletic' }, { value: 'formal', label: 'Formal' },
        { value: 'vintage', label: 'Vintage' }, { value: 'custom', label: 'Custom Style' }
    ];

    const logoPositionOptions = [
        { value: 'front-center', label: 'Front Center' }, { value: 'front-left', label: 'Front Left Chest' },
        { value: 'back-center', label: 'Back Center' }, { value: 'sleeve', label: 'Sleeve' },
        { value: 'custom', label: 'Custom Position' }
    ];

    const logoSizeOptions = [
        { value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' }, { value: 'custom', label: 'Custom Size' }
    ];

    const handleConfigChange = (field, value) => {
        setProductConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setError('');
        if (!file.type.match('image.*')) {
            setError('Please select an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('File size should be less than 5MB');
            return;
        }
        if (logoPreview && logoPreview.startsWith('blob:')) {
            URL.revokeObjectURL(logoPreview);
        }
        setLogoFile(file);
        const objectUrl = URL.createObjectURL(file);
        setLogoPreview(objectUrl);
        if (!generateVisualization) {
            setGenerateVisualization(true);
        }
    };

    const calculatePrice = () => {
        const basePrices = {
            't-shirt': 8.99, 'polo': 12.99, 'hoodie': 18.99, 'jeans': 22.99,
            'pants': 19.99, 'jacket': 25.99, 'custom': 20.99
        };
        const basePrice = basePrices[productConfig.clothingType] || 15.99;
        let total = basePrice * productConfig.quantity;
        if (['linen', 'denim'].includes(productConfig.fabric)) total *= 1.2;
        if (productConfig.clothingType === 'custom' || productConfig.color === 'custom' || productConfig.fabric === 'custom') total *= 1.15;
        return {
            unitPrice: basePrice,
            subtotal: total,
            tax: total * 0.08,
            total: total * 1.08
        };
    };

    const generateClothingImage = async () => {
        setError('');
        setGenerateVisualization(true);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const pricingDetails = calculatePrice();
            const orderData = {
                items: [{
                    type: 'clothing',
                    productId: productConfig.clothingType,
                    quantity: productConfig.quantity,
                    price: pricingDetails.unitPrice,
                    customizations: {
                        size: productConfig.size,
                        color: productConfig.color === 'custom' ? productConfig.customColorHex : productConfig.color,
                        fabric: productConfig.fabric === 'custom' ? productConfig.customFabric : productConfig.fabric,
                        style: productConfig.style === 'custom' ? productConfig.customStyle : productConfig.style,
                        logo: logoPreview ? true : false,
                        logoPosition: productConfig.logoPosition,
                        logoSize: productConfig.logoSize
                    }
                }],
                shippingAddress: {
                    name: "Customer Name", companyName: "Company Name", address: "123 Main St",
                    city: "City", state: "State", zipCode: "12345", country: "Country", phoneNumber: "555-123-4567"
                },
                subtotal: pricingDetails.subtotal,
                tax: pricingDetails.tax,
                shipping: 0,
                total: pricingDetails.total
            };
            const response = await axios.post('http://localhost:5000/api/orders', orderData);
            addToCart({
                id: Date.now().toString(),
                name: `${productConfig.color} ${productConfig.clothingType} (${productConfig.size.toUpperCase()})`,
                price: pricingDetails.unitPrice,
                quantity: productConfig.quantity,
                image: null,
                customizations: {
                    color: productConfig.color === 'custom' ? productConfig.customColorHex : productConfig.color,
                    size: productConfig.size,
                    fabric: productConfig.fabric === 'custom' ? productConfig.customFabric : productConfig.fabric,
                    style: productConfig.style === 'custom' ? productConfig.customStyle : productConfig.style,
                    logo: logoPreview ? true : false
                }
            });
            setSuccess('Your order has been added to the cart!');
            setOrderSummary({
                clothingType: productConfig.clothingType,
                color: productConfig.color === 'custom' ? productConfig.customColorHex : productConfig.color,
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
            if (process.env.NODE_ENV !== 'production') {
                const pricingDetails = calculatePrice();
                addToCart({
                    id: `dev-${Date.now()}`,
                    name: `${productConfig.color} ${productConfig.clothingType} (${productConfig.size.toUpperCase()})`,
                    price: pricingDetails.unitPrice,
                    quantity: productConfig.quantity,
                    image: null,
                    customizations: {
                        color: productConfig.color === 'custom' ? productConfig.customColorHex : productConfig.color,
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
                <div className="space-y-6">
                    <Card variant="bordered">
                        <CardHeader>
                            <CardTitle>Product Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Clothing Type</label>
                                <select
  value={productConfig.clothingType}
  onChange={(e) => handleConfigChange('clothingType', e.target.value)}
  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out appearance-none bg-white text-gray-700 cursor-pointer hover:border-blue-400"
  style={{
    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='5' viewBox='0 0 10 5'><path fill='none' stroke='%233B82F6' stroke-width='2' d='M0 0l5 5 5-5'/></svg>")`,
    backgroundPosition: 'right 0.75rem center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '10px 5px',
  }}
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
                                        className="mt-2 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                )}
                            </div>

                            {/* Enhanced Color Selection */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Color</label>
                                <div className="flex mb-4 space-x-2">
                                    <button
                                        onClick={() => handleConfigChange('colorSelectionMode', 'preset')}
                                        className={`flex-1 py-2 px-4 text-sm rounded-lg transition-colors duration-200 ${productConfig.colorSelectionMode === 'preset' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                                    >
                                        Preset Colors
                                    </button>
                                    <button
                                        onClick={() => handleConfigChange('colorSelectionMode', 'custom')}
                                        className={`flex-1 py-2 px-4 text-sm rounded-lg transition-colors duration-200 ${productConfig.colorSelectionMode === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                                    >
                                        Custom Color
                                    </button>
                                </div>

                                {productConfig.colorSelectionMode === 'preset' ? (
                                        <select
                                        value={productConfig.color}
                                        onChange={(e) => handleConfigChange('color', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out appearance-none bg-white text-gray-700 cursor-pointer hover:border-blue-400"
                                        style={{
                                          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='5' viewBox='0 0 10 5'><path fill='none' stroke='%233B82F6' stroke-width='2' d='M0 0l5 5 5-5'/></svg>")`,
                                          backgroundPosition: 'right 0.75rem center',
                                          backgroundRepeat: 'no-repeat',
                                          backgroundSize: '10px 5px',
                                        }}
                                      >
                                        {presetColors.map(option => (
                                          <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                      </select>
                                    ) : (
                                        // Custom color section remains unchanged


                                
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-4">
                                            <input
                                                type="color"
                                                value={productConfig.customColorHex || '#FFFFFF'}
                                                onChange={(e) => handleConfigChange('customColorHex', e.target.value)}
                                                className="w-16 h-16 rounded-full border-0 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Custom color name (e.g., Sky Blue)"
                                                value={productConfig.customColor || ''}
                                                onChange={(e) => setProductConfig({
                                                    ...productConfig,
                                                    customColor: e.target.value,
                                                    color: 'custom'
                                                })}
                                                className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {customColors.map(color => (
                                                <div
                                                    key={color.name}
                                                    onClick={() => setProductConfig({
                                                        ...productConfig,
                                                        customColorHex: color.hex,
                                                        customColor: color.name,
                                                        color: 'custom'
                                                    })}
                                                    className={`${cardInteractions.selectable} h-8 w-full rounded-full relative flex items-center justify-center ${productConfig.customColorHex === color.hex ? 'ring-2 ring-blue-500' : ''}`}
                                                    style={{ backgroundColor: color.hex }}
                                                    title={color.name}
                                                >
                                                    {productConfig.customColorHex === color.hex && (
                                                        <svg className="w-4 h-4 text-white drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                    <span className="absolute text-xs text-white font-medium opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black bg-opacity-50 rounded px-1 py-0.5">{color.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="mt-3 flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">Selected:</span>
                                    <div
                                        className="h-6 w-6 rounded-full border transition-all duration-200"
                                        style={{ backgroundColor: productConfig.color === 'custom' ? productConfig.customColorHex : getHexFromColorName(productConfig.color) }}
                                    />
                                    <span className="text-sm">
                                        {productConfig.color === 'custom' ? (productConfig.customColor || 'Custom') : presetColors.find(c => c.value === productConfig.color)?.label || productConfig.color}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Size</label>
                                <select
  value={productConfig.size}
  onChange={(e) => handleConfigChange('size', e.target.value)}
  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out appearance-none bg-white text-gray-700 cursor-pointer hover:border-blue-400"
  style={{
    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='5' viewBox='0 0 10 5'><path fill='none' stroke='%233B82F6' stroke-width='2' d='M0 0l5 5 5-5'/></svg>")`,
    backgroundPosition: 'right 0.75rem center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '10px 5px',
  }}
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
                                        className="mt-2 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Fabric</label>
                                <select
  value={productConfig.fabric}
  onChange={(e) => handleConfigChange('fabric', e.target.value)}
  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out appearance-none bg-white text-gray-700 cursor-pointer hover:border-blue-400"
  style={{
    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='5' viewBox='0 0 10 5'><path fill='none' stroke='%233B82F6' stroke-width='2' d='M0 0l5 5 5-5'/></svg>")`,
    backgroundPosition: 'right 0.75rem center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '10px 5px',
  }}
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
                                        className="mt-2 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Style</label>
                                <select
  value={productConfig.style}
  onChange={(e) => handleConfigChange('style', e.target.value)}
  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out appearance-none bg-white text-gray-700 cursor-pointer hover:border-blue-400"
  style={{
    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='5' viewBox='0 0 10 5'><path fill='none' stroke='%233B82F6' stroke-width='2' d='M0 0l5 5 5-5'/></svg>")`,
    backgroundPosition: 'right 0.75rem center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '10px 5px',
  }}
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
                                        className="mt-2 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Order Size (Minimum 50 pieces)</label>
                                <input
                                    type="number"
                                    min="50"
                                    value={productConfig.quantity}
                                    onChange={(e) => handleConfigChange('quantity', parseInt(e.target.value))}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card variant="bordered">
                        <CardHeader>
                            <CardTitle>Logo Options</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Logo Position</label>
                                <select
  value={productConfig.logoPosition}
  onChange={(e) => handleConfigChange('logoPosition', e.target.value)}
  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out appearance-none bg-white text-gray-700 cursor-pointer hover:border-blue-400"
  style={{
    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='5' viewBox='0 0 10 5'><path fill='none' stroke='%233B82F6' stroke-width='2' d='M0 0l5 5 5-5'/></svg>")`,
    backgroundPosition: 'right 0.75rem center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '10px 5px',
  }}
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
                                        className="mt-2 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Logo Size</label>
                                <select
  value={productConfig.logoSize}
  onChange={(e) => handleConfigChange('logoSize', e.target.value)}
  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out appearance-none bg-white text-gray-700 cursor-pointer hover:border-blue-400"
  style={{
    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='5' viewBox='0 0 10 5'><path fill='none' stroke='%233B82F6' stroke-width='2' d='M0 0l5 5 5-5'/></svg>")`,
    backgroundPosition: 'right 0.75rem center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '10px 5px',
  }}
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
                                        className="mt-2 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                )}
                            </div>

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
                                                <img
                                                    src={logoPreview}
                                                    alt="Logo Preview"
                                                    className="max-h-48 mx-auto object-contain"
                                                    onLoad={() => console.log("Logo image loaded successfully")}
                                                    onError={(e) => {
                                                        console.error('Failed to load logo preview image');
                                                        e.target.alt = 'Failed to load logo';
                                                        setError('Failed to display logo preview');
                                                    }}
                                                />
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
                                                <p className="text-xs text-gray-500">PNG, JPG, or SVG (max. 5MB)</p>
                                                <p className="text-xs mt-2">
                                                    <a href="/image-generator" className="text-blue-600 hover:underline">Generate a logo first</a> if you don't have one
                                                </p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

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
                                        Generate 3D visualization
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Preview your clothing with logo in 3D
                                </p>
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

                <div className="space-y-6">
                    {generateVisualization && logoPreview && (
                        <Card variant="bordered">
                            <CardHeader>
                                <CardTitle>3D Visualization</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ClothingVisualizer
                                    clothingType={productConfig.clothingType}
                                    color={productConfig.color === 'custom' ? productConfig.customColorHex : productConfig.color}
                                    logoImage={logoPreview}
                                    logoPosition={productConfig.logoPosition}
                                    logoSize={productConfig.logoSize}
                                />
                                <div className="mt-4 text-center">
                                    <p className="text-sm text-gray-600">
                                        Preview of your {productConfig.color === 'custom' ? productConfig.customColor : productConfig.color} {productConfig.clothingType}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Actual product may vary</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card variant="bordered">
                        <CardHeader>
                            <CardTitle>Price Estimation</CardTitle>
                        </CardHeader>
                        <CardContent>
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

                    <Card variant="bordered">
                        <CardHeader>
                            <CardTitle>Product Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-medium">Quality Information</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        All our clothing is manufactured to the highest standards using premium quality materials.
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

//up