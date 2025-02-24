import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card/Card';
import { Alert, AlertDescription } from '../components/ui/alert/Alert';
import { logoApi } from '../api/logoApi';
import AppError from '../utils/AppError';

const ImageGenerator = () => {
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

    try {
      setLoading(true);
      setError('');

      console.log('Generating logo with config:', logoConfig);

      const response = await logoApi.generateLogo(logoConfig);

      console.log('Logo generation response:', response);

      if (response?.imageUrl) {
        setGeneratedLogo(response.imageUrl);
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

  // Rest of the component remains the same
  return (
    <Card className="w-full">
      <CardContent>
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-4">Logo Generator</h3>
          
          {error && (
            <Alert variant="error" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Logo Text"
              value={logoConfig.text}
              onChange={(e) => setLogoConfig({ ...logoConfig, text: e.target.value })}
              className="w-full p-2 border rounded"
            />
            
            {/* Other inputs for color, size, style, etc. */}
            
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              {loading ? 'Generating...' : 'Generate Logo'}
            </button>

            {generatedLogo && (
              <div className="mt-4">
                <img 
                  src={generatedLogo} 
                  alt="Generated Logo" 
                  className="max-w-full h-auto"
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageGenerator;