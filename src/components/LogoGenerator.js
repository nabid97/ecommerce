import React, { useState } from 'react';
import { Card, CardContent } from './ui/card/Card';
import { Alert, AlertDescription } from './ui/alert/Alert';
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

  const generatePrompt = (config) => {
    return `Generate a professional ${config.style} logo with text "${config.text}" in ${config.font} font. 
    The logo should use ${config.color} as the main color and ${config.backgroundColor} as the background color. 
    Make it minimalistic and modern with clean lines.`;
  };

  const handleGenerate = async () => {
    if (!logoConfig.text.trim()) {
      setError('Please enter logo text');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axios.post('/api/logos/generate', {
        prompt: generatePrompt(logoConfig),
        config: logoConfig
      });

      if (response.data?.imageUrl) {
        setGeneratedLogo(response.data.imageUrl);
        onLogoGenerate?.(response.data.imageUrl);
      } else {
        throw new Error('Failed to generate logo');
      }
    } catch (err) {
      console.error('Error generating logo:', err);
      setError(err.response?.data?.message || err.message || 'Failed to generate logo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full" data-testid="logo-generator">
      <CardContent>
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-4">Logo Generator</h3>
          
          {error && (
            <Alert variant="error" className="mb-4" data-testid="error-message">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="logo-text" className="block text-sm font-medium mb-1">
                Logo Text
              </label>
              <input
                id="logo-text"
                type="text"
                className="w-full p-2 border rounded"
                value={logoConfig.text}
                onChange={(e) => setLogoConfig({ ...logoConfig, text: e.target.value })}
                data-testid="logo-text-input"
              />
            </div>

            <div>
              <label htmlFor="logo-font" className="block text-sm font-medium mb-1">
                Font
              </label>
              <select
                id="logo-font"
                value={logoConfig.font}
                onChange={(e) => setLogoConfig({ ...logoConfig, font: e.target.value })}
                className="w-full p-2 border rounded"
                data-testid="logo-font-select"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="logo-color" className="block text-sm font-medium mb-1">
                  Text Color
                </label>
                <input
                  id="logo-color"
                  type="color"
                  value={logoConfig.color}
                  onChange={(e) => setLogoConfig({ ...logoConfig, color: e.target.value })}
                  className="w-full h-10"
                  data-testid="logo-color-input"
                />
              </div>
              <div>
                <label htmlFor="logo-bg-color" className="block text-sm font-medium mb-1">
                  Background Color
                </label>
                <input
                  id="logo-bg-color"
                  type="color"
                  value={logoConfig.backgroundColor}
                  onChange={(e) => setLogoConfig({ ...logoConfig, backgroundColor: e.target.value })}
                  className="w-full h-10"
                  data-testid="logo-background-color-input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="logo-size" className="block text-sm font-medium mb-1">
                Size
              </label>
              <select
                id="logo-size"
                value={logoConfig.size}
                onChange={(e) => setLogoConfig({ ...logoConfig, size: e.target.value })}
                className="w-full p-2 border rounded"
                data-testid="logo-size-select"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div>
              <label htmlFor="logo-style" className="block text-sm font-medium mb-1">
                Style
              </label>
              <select
                id="logo-style"
                value={logoConfig.style}
                onChange={(e) => setLogoConfig({ ...logoConfig, style: e.target.value })}
                className="w-full p-2 border rounded"
                data-testid="logo-style-select"
              >
                <option value="modern">Modern</option>
                <option value="classic">Classic</option>
                <option value="minimalist">Minimalist</option>
                <option value="bold">Bold</option>
                <option value="elegant">Elegant</option>
              </select>
            </div>

            {generatedLogo && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Preview</label>
                <div className="border rounded p-4 flex justify-center">
                  <img 
                    src={generatedLogo} 
                    alt="Generated Logo" 
                    className="max-w-full h-auto"
                    data-testid="generated-logo"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !logoConfig.text.trim()}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              data-testid="generate-logo-button"
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