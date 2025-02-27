import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card/Card';
import { Alert, AlertDescription } from '../components/ui/alert/Alert';
import { logoApi } from '../api/logoApi';
import AppError from '../utils/AppError';
import { useAuth } from '../contexts/AuthContext'; // Import auth context

const ImageGenerator = () => {
  const { user } = useAuth(); // Get user from auth context
  const [logoConfig, setLogoConfig] = useState({
    text: '',
    color: '#000000',
    backgroundColor: '#FFFFFF',
    size: 'medium',
    style: 'modern',
    font: 'Arial'
  });

  const [generatedLogo, setGeneratedLogo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!logoConfig.text.trim()) {
      setError('Please enter logo text');
      return;
    }

    // Optional: Check for user authentication
    // Commenting this out for now as it was causing an error
    /*
    if (!user) {
      setError('Please sign in to generate images');
      return;
    }
    */

    try {
      setLoading(true);
      setError('');

      console.log('Generating logo with config:', logoConfig);

      const response = await logoApi.generateLogo(logoConfig);

      console.log('Logo generation response:', response);

      if (response?.imageUrl) {
        // Verify the URL is valid before setting it
        try {
          // Test if URL is valid
          new URL(response.imageUrl);
          setGeneratedLogo(response.imageUrl);
        } catch (urlError) {
          console.error('Invalid image URL received:', response.imageUrl);
          
          // Fall back to local placeholder if URL is invalid
          setGeneratedLogo('/logo-placeholder.svg');
          setError('Generated logo URL was invalid. Using placeholder instead.');
        }
      } else {
        throw new Error('Failed to generate logo');
      }
    } catch (err) {
      console.error('Detailed logo generation error:', err);
      
      // Handle different types of errors
      if (err instanceof AppError) {
        setError(err.message);
      } else if (err.response) {
        setError(err.response.data.message || 'Failed to generate logo');
      } else {
        setError(err.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Logo Generator</h1>
      
      <Card className="w-full">
        <CardContent>
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-4">Create Your Custom Logo</h3>
            
            {error && (
              <Alert variant="error" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Logo Text</label>
                <input
                  type="text"
                  placeholder="Enter your company or brand name"
                  value={logoConfig.text}
                  onChange={(e) => setLogoConfig({ ...logoConfig, text: e.target.value })}
                  className="w-full p-2 border rounded"
                  data-testid="logo-text-input"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Text Color</label>
                  <input
                    type="color"
                    value={logoConfig.color}
                    onChange={(e) => setLogoConfig({ ...logoConfig, color: e.target.value })}
                    className="w-full h-10"
                    data-testid="logo-color-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Background Color</label>
                  <input
                    type="color"
                    value={logoConfig.backgroundColor}
                    onChange={(e) => setLogoConfig({ ...logoConfig, backgroundColor: e.target.value })}
                    className="w-full h-10"
                    data-testid="logo-bg-color-input"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Font</label>
                <select
                  value={logoConfig.font}
                  onChange={(e) => setLogoConfig({ ...logoConfig, font: e.target.value })}
                  className="w-full p-2 border rounded"
                  data-testid="logo-font-select"
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Courier">Courier</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Size</label>
                <select
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
                <label className="block text-sm font-medium mb-1">Style</label>
                <select
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
            
            {generatedLogo && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Your Generated Logo</h3>
                <div className="border rounded p-4 flex justify-center bg-white">
                  <img 
                    src={generatedLogo} 
                    alt="Generated Logo" 
                    className="max-w-full h-auto max-h-60"
                    data-testid="generated-logo"
                    onError={(e) => {
                      console.error('Image failed to load:', generatedLogo);
                      e.target.onerror = null; 
                      e.target.src = '/api/placeholder/400/320';
                      setError('Error loading the generated logo image. Using placeholder instead.');
                    }}
                  />
                </div>
                <div className="mt-4 flex justify-center">
                  <a 
                    href={generatedLogo}
                    download="my-logo.png"
                    className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download Logo
                  </a>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageGenerator;