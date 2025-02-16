import React, { useState } from 'react';
import { Card, CardContent } from './ui/card/Card';
import axios from 'axios';

const LogoGenerator = ({ onLogoGenerate }) => {
  const [logoConfig, setLogoConfig] = useState({
    text: '',
    color: '#000000',
    size: 'medium',
    style: 'modern',
    font: 'Arial',
    backgroundColor: '#ffffff'
  });

  const [generatedLogo, setGeneratedLogo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Function to generate prompt for DeepSeek
  const generatePrompt = (config) => {
    return `Generate a professional ${config.style} logo with text "${config.text}" in ${config.font} font. 
    The logo should use ${config.color} as the main color and ${config.backgroundColor} as the background color. 
    The logo should be ${config.size} in size and suitable for business use.
    Make it minimalistic and modern with clean lines.`;
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError('');

      // DeepSeek API configuration
      const deepseekConfig = {
        method: 'post',
        url: 'https://api.deepseek.com/v1/images/generations',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_DEEPSEEK_API_KEY}`
        },
        data: {
          prompt: generatePrompt(logoConfig),
          n: 1, // Number of images to generate
          size: '1024x1024', // Image size
          response_format: 'url'
        }
      };

      // Call DeepSeek API
      const response = await axios(deepseekConfig);

      if (response.data && response.data.data && response.data.data.length > 0) {
        const generatedImageUrl = response.data.data[0].url;
        setGeneratedLogo(generatedImageUrl);
        onLogoGenerate(generatedImageUrl);

        // Save generated logo to your backend/S3
        await saveGeneratedLogo(generatedImageUrl);
      } else {
        throw new Error('No image was generated');
      }
    } catch (err) {
      console.error('Error generating logo:', err);
      setError(err.message || 'Error generating logo');
    } finally {
      setLoading(false);
    }
  };

  // Function to save generated logo to your backend/S3
  const saveGeneratedLogo = async (imageUrl) => {
    try {
      const response = await axios.post('/api/save-logo', {
        imageUrl,
        config: logoConfig
      });
      return response.data.savedUrl;
    } catch (err) {
      console.error('Error saving logo:', err);
      throw new Error('Failed to save generated logo');
    }
  };

  return (
    <Card className="w-full">
      <CardContent>
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-4">Logo Generator</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Logo Text</label>
              <input
                type="text"
                placeholder="Enter your logo text"
                className="w-full p-2 border rounded"
                value={logoConfig.text}
                onChange={(e) => setLogoConfig({ ...logoConfig, text: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Font</label>
              <select
                value={logoConfig.font}
                onChange={(e) => setLogoConfig({ ...logoConfig, font: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Text Color</label>
                <input
                  type="color"
                  value={logoConfig.color}
                  onChange={(e) => setLogoConfig({ ...logoConfig, color: e.target.value })}
                  className="w-full h-10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Background Color</label>
                <input
                  type="color"
                  value={logoConfig.backgroundColor}
                  onChange={(e) => setLogoConfig({ ...logoConfig, backgroundColor: e.target.value })}
                  className="w-full h-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Size</label>
              <select
                value={logoConfig.size}
                onChange={(e) => setLogoConfig({ ...logoConfig, size: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Style</label>
              <select
                value={logoConfig.style}
                onChange={(e) => setLogoConfig({ ...logoConfig, style: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="modern">Modern</option>
                <option value="classic">Classic</option>
                <option value="minimalist">Minimalist</option>
                <option value="bold">Bold</option>
                <option value="elegant">Elegant</option>
              </select>
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            {generatedLogo && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Preview</label>
                <div className="border rounded p-4 flex justify-center">
                  <img 
                    src={generatedLogo} 
                    alt="Generated Logo" 
                    className="max-w-full h-auto"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !logoConfig.text}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </div>
              ) : (
                'Generate Logo'
              )}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LogoGenerator;