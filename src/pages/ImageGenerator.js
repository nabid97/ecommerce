import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card/Card';
import { Alert, AlertDescription } from '../components/ui/alert/Alert';
import { useAuth } from '../contexts/AuthContext';
import { logoApi } from '../api';

const ImageGenerator = () => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generationHistory, setGenerationHistory] = useState([]);

  const [settings, setSettings] = useState({
    size: '1024x1024',
    style: 'modern',
    colorScheme: 'vibrant',
    format: 'png'
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await logoApi.generateLogo({
        prompt,
        ...settings,
        userId: user.id
      });

      if (response.imageUrl) {
        setGeneratedImage(response.imageUrl);
        setGenerationHistory(prev => [...prev, {
          prompt,
          imageUrl: response.imageUrl,
          timestamp: new Date().toISOString(),
          settings
        }]);
      } else {
        throw new Error('Failed to generate image');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveImage = async () => {
    if (!generatedImage) return;

    try {
      await logoApi.saveLogo({
        imageUrl: generatedImage,
        prompt,
        settings,
        userId: user.id
      });

      // Show success message or handle UI update
    } catch (err) {
      setError('Failed to save image');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">AI Image Generator</h1>

        {error && (
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Describe your image
                  </label>
                  <textarea
                    rows="4"
                    className="w-full p-3 border rounded-md shadow-sm"
                    placeholder="Describe what you want to generate..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Size
                    </label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={settings.size}
                      onChange={(e) => setSettings({ ...settings, size: e.target.value })}
                    >
                      <option value="512x512">Small (512x512)</option>
                      <option value="1024x1024">Medium (1024x1024)</option>
                      <option value="2048x2048">Large (2048x2048)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Style
                    </label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={settings.style}
                      onChange={(e) => setSettings({ ...settings, style: e.target.value })}
                    >
                      <option value="modern">Modern</option>
                      <option value="artistic">Artistic</option>
                      <option value="realistic">Realistic</option>
                      <option value="minimalist">Minimalist</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Color Scheme
                  </label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={settings.colorScheme}
                    onChange={(e) => setSettings({ ...settings, colorScheme: e.target.value })}
                  >
                    <option value="vibrant">Vibrant</option>
                    <option value="pastel">Pastel</option>
                    <option value="monochrome">Monochrome</option>
                    <option value="earth">Earth Tones</option>
                  </select>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
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

          <div className="space-y-6">
            {generatedImage && (
              <Card>
                <CardContent>
                  <h3 className="text-lg font-medium mb-4">Generated Image</h3>
                  <div className="border rounded-lg p-2">
                    <img
                      src={generatedImage}
                      alt="Generated"
                      className="w-full h-auto rounded"
                    />
                  </div>
                  <button
                    onClick={handleSaveImage}
                    className="mt-4 w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                  >
                    Save Image
                  </button>
                </CardContent>
              </Card>
            )}

            {generationHistory.length > 0 && (
              <Card>
                <CardContent>
                  <h3 className="text-lg font-medium mb-4">Recent Generations</h3>
                  <div className="space-y-4">
                    {generationHistory.slice(0, 5).map((item, index) => (
                      <div key={index} className="border-b pb-4 last:border-b-0">
                        <img
                          src={item.imageUrl}
                          alt={item.prompt}
                          className="w-full h-32 object-cover rounded mb-2"
                        />
                        <p className="text-sm text-gray-600 truncate">
                          {item.prompt}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;