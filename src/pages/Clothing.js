import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card/Card';
import { Alert, AlertDescription } from '../components/ui/alert/Alert';

// Internal Logo Generator Component
const LogoGenerator = ({ onLogoGenerate }) => {
  const [logoConfig, setLogoConfig] = useState({
    text: '',
    color: '#000000',
    size: 'medium',
    style: 'modern'
  });

  const handleGenerate = () => {
    onLogoGenerate(logoConfig);
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Logo Generator</h3>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Logo Text"
          className="w-full p-2 border rounded"
          value={logoConfig.text}
          onChange={(e) => setLogoConfig({ ...logoConfig, text: e.target.value })}
        />
        <div>
          <label className="block mb-2">Color</label>
          <input
            type="color"
            value={logoConfig.color}
            onChange={(e) => setLogoConfig({ ...logoConfig, color: e.target.value })}
          />
        </div>
        <select
          value={logoConfig.size}
          onChange={(e) => setLogoConfig({ ...logoConfig, size: e.target.value })}
          className="w-full p-2 border rounded"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
        <select
          value={logoConfig.style}
          onChange={(e) => setLogoConfig({ ...logoConfig, style: e.target.value })}
          className="w-full p-2 border rounded"
        >
          <option value="modern">Modern</option>
          <option value="classic">Classic</option>
          <option value="minimalist">Minimalist</option>
        </select>
        <button
          onClick={handleGenerate}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Generate Logo
        </button>
      </div>
    </div>
  );
};

// Internal Image Uploader Component
const ImageUploader = ({ onImageUpload }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (file) {
      try {
        const uploadedUrl = await onImageUpload(file);
        return uploadedUrl;
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Upload Logo</h3>
      <div className="space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full"
        />
        {preview && (
          <div className="mt-4">
            <img src={preview} alt="Preview" className="max-w-xs mx-auto" />
          </div>
        )}
        <button
          onClick={handleUpload}
          disabled={!file}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          Upload
        </button>
      </div>
    </div>
  );
};

// Main Clothing Component
const Clothing = () => {
  const [productConfig, setProductConfig] = useState({
    size: '',
    color: '',
    fabric: '',
    orderSize: 50,
    logo: null
  });

  const [error, setError] = useState('');
  const [orderSummary, setOrderSummary] = useState(null);

  const handleLogoUpload = async (file) => {
    try {
      // Integration with S3 upload service
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setProductConfig(prev => ({ ...prev, logo: data.url }));
        return data.url;
      }
    } catch (error) {
      setError('Failed to upload logo');
    }
  };

  const handleLogoGenerate = (logoConfig) => {
    // Integration with logo generation service
    setProductConfig(prev => ({ ...prev, logo: logoConfig }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productConfig),
      });

      if (response.ok) {
        // Handle successful order
        setOrderSummary(await response.json());
      } else {
        setError('Failed to place order');
      }
    } catch (error) {
      setError('An error occurred');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Customize Your Clothing</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Size</label>
                  <select
                    value={productConfig.size}
                    onChange={(e) => setProductConfig({ ...productConfig, size: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Size</option>
                    <option value="s">Small</option>
                    <option value="m">Medium</option>
                    <option value="l">Large</option>
                    <option value="xl">X-Large</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2">Color</label>
                  <select
                    value={productConfig.color}
                    onChange={(e) => setProductConfig({ ...productConfig, color: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Color</option>
                    <option value="white">White</option>
                    <option value="black">Black</option>
                    <option value="navy">Navy</option>
                    <option value="red">Red</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2">Fabric</label>
                  <select
                    value={productConfig.fabric}
                    onChange={(e) => setProductConfig({ ...productConfig, fabric: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Fabric</option>
                    <option value="cotton">Cotton</option>
                    <option value="polyester">Polyester</option>
                    <option value="blend">Cotton-Polyester Blend</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2">Order Size (Minimum 50 pieces)</label>
                  <input
                    type="number"
                    min="50"
                    value={productConfig.orderSize}
                    onChange={(e) => setProductConfig({ ...productConfig, orderSize: parseInt(e.target.value) })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Place Order
          </button>
        </div>

        <div className="space-y-8">
          <ImageUploader onImageUpload={handleLogoUpload} />
          <LogoGenerator onLogoGenerate={handleLogoGenerate} />
          
          {orderSummary && (
            <Card>
              <CardContent>
                <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <p>Size: {orderSummary.size}</p>
                  <p>Color: {orderSummary.color}</p>
                  <p>Fabric: {orderSummary.fabric}</p>
                  <p>Quantity: {orderSummary.orderSize} pieces</p>
                  <p className="font-semibold">Total: ${orderSummary.total}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Clothing;