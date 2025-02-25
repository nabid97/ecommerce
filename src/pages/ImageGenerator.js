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

    if (!user) {
      setError('Please sign in to generate images');
      return;
    }

    try {
      setLoading(true);
      setError('');

<<<<<<< HEAD
      console.log('Generating logo with config:', logoConfig);

      const response = await logoApi.generateLogo(logoConfig);

      console.log('Logo generation response:', response);

      if (response?.imageUrl) {
        setGeneratedLogo(response.imageUrl);
=======
      // Create request payload with null check for user
      const payload = {
        prompt,
        ...settings,
        userId: user?.id // Optional chaining
      };

      const response = await logoApi.generateLogo(payload);

      if (response?.imageUrl) {
        setGeneratedImage(response.imageUrl);
        setGenerationHistory(prev => [
          {
            prompt,
            imageUrl: response.imageUrl,
            timestamp: new Date().toISOString(),
            settings
          },
          ...prev
        ].slice(0, 5)); // Keep only last 5 generations
>>>>>>> 0debe13269b25c54fb4fa8cde1294e72ff73f8eb
      } else {
        throw new Error('Failed to generate logo');
      }
    } catch (err) {
<<<<<<< HEAD
      console.error('Detailed logo generation error:', err);
      
      // Handle different types of errors
      if (err instanceof AppError) {
        setError(err.message);
      } else if (err.response) {
        setError(err.response.data.message || 'Failed to generate logo');
      } else {
        setError(err.message || 'An unexpected error occurred');
      }
=======
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate image. Please try again.');
>>>>>>> 0debe13269b25c54fb4fa8cde1294e72ff73f8eb
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
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
=======
  const handleSaveImage = async () => {
    if (!generatedImage) {
      setError('No image to save');
      return;
    }

    if (!user) {
      setError('Please sign in to save images');
      return;
    }

    try {
      await logoApi.saveLogo({
        imageUrl: generatedImage,
        prompt,
        settings,
        userId: user.id
      });

      // Show success message
      alert('Image saved successfully!');
    } catch (err) {
      setError('Failed to save image. Please try again.');
    }
  };

  // No changes needed for the JSX part as it's already correct

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="image-generator">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">AI Image Generator</h1>

        {!user && (
          <Alert className="mb-6">
            <AlertDescription>
              Please sign in to generate and save images
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6" data-testid="error-alert">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Rest of your JSX remains the same */}
        
        {/* Just add data-testid attributes to important elements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Describe your image
                  </label>
                  <textarea
                    data-testid="prompt-input"
                    rows="4"
                    className="w-full p-3 border rounded-md shadow-sm"
                    placeholder="Describe what you want to generate..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>

                {/* Add data-testid to all your form elements */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Size
                    </label>
                    <select
                      data-testid="size-select"
                      className="w-full p-2 border rounded-md"
                      value={settings.size}
                      onChange={(e) => setSettings({ ...settings, size: e.target.value })}
                    >
                      {/* Your options remain the same */}
                    </select>
                  </div>
                  {/* Rest of your form elements remain the same */}
                </div>

                <button
                  data-testid="generate-button"
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim() || !user}
                  className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating...
                    </div>
                  ) : 'Generate Image'}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Rest of your component remains the same */}
>>>>>>> 0debe13269b25c54fb4fa8cde1294e72ff73f8eb
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageGenerator;