import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDivider, CardActions } from '../components/ui/card/Card';
import { Alert, AlertDescription } from '../components/ui/alert/Alert';
import { logoApi } from '../api/logoApi';
import { useAuth } from '../contexts/AuthContext';

const ImageGenerator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [logoConfig, setLogoConfig] = useState({
    text: '',
    color: '#3B82F6',
    backgroundColor: '#FFFFFF',
    size: 'medium',
    style: 'modern',
    font: 'Arial',
    textEffect: 'normal',
    additionalInstructions: ''
  });

  const [generatedLogo, setGeneratedLogo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('generator');

  const fontOptions = [
    { value: 'Arial', label: 'Arial (Sans-serif)' },
    { value: 'Helvetica', label: 'Helvetica (Sans-serif)' },
    { value: 'Times New Roman', label: 'Times New Roman (Serif)' },
    { value: 'Georgia', label: 'Georgia (Serif)' },
    { value: 'Verdana', label: 'Verdana (Sans-serif)' },
    { value: 'Futura', label: 'Futura (Modern)' },
    { value: 'Garamond', label: 'Garamond (Classic)' },
    { value: 'Montserrat', label: 'Montserrat (Contemporary)' },
    { value: 'Random', label: 'Random' }
  ];

  const styleOptions = [
    { value: 'modern', label: 'Modern' },
    { value: 'classic', label: 'Classic' },
    { value: 'minimalist', label: 'Minimalist' },
    { value: 'bold', label: 'Bold' },
    { value: 'elegant', label: 'Elegant' },
    { value: 'geometric', label: 'Geometric' },
    { value: 'abstract', label: 'Abstract' },
    { value: 'vintage', label: 'Vintage' },
    { value: 'random', label: 'Random' },
    { value: 'Football', label: 'Football' }
  ];

  const sizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'random', label: 'Random' }
  ];

  const colorOptions = [
    { label: 'Red', value: '#FF0000' },
    { label: 'Green', value: '#00FF00' },
    { label: 'Blue', value: '#0000FF' },
    { label: 'Yellow', value: '#FFFF00' },
    { label: 'Purple', value: '#800080' },
    { label: 'Orange', value: '#FFA500' },
    { label: 'Pink', value: '#FFC0CB' },
    { label: 'Brown', value: '#8B4513' },
    { label: 'Gray', value: '#808080' },
    { label: 'Black', value: '#000000' },
    { label: 'White', value: '#FFFFFF' }
  ];

  const textEffectOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'bold', label: 'Bold' },
    { value: 'italic', label: 'Italic' },
    { value: 'underline', label: 'Underline' }
  ];

  const generatePrompt = (config) => {
    return `Design a professional ${config.style} logo that strictly follows these specifications. The final image should ONLY contain the logo design and no additional text, labels, or annotations:
  - Logo Text: "${config.text}"
  - Font: ${config.font}
  - Text Effect: ${config.textEffect}
  - Primary Color: ${config.color}
  - Background Color: ${config.backgroundColor}
  - Dimensions: ${config.size}
  ${config.additionalInstructions ? `- Additional Instructions: ${config.additionalInstructions}` : ''}
  Ensure the design is clean, minimalistic, and suitable for business use. Do not include any extraneous elements or random text.`;
  };

  const handleGenerate = async () => {
    if (!logoConfig.text.trim()) {
      setError('Please enter logo text');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setCopied(false);
      const response = await logoApi.generateLogo(logoConfig);
      if (response?.imageUrl) {
        setGeneratedLogo(response.imageUrl);
      } else {
        throw new Error('Failed to generate logo');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to generate logo');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLogoUrl = () => {
    if (generatedLogo) {
      navigator.clipboard.writeText(generatedLogo)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => console.error('Failed to copy:', err));
    }
  };

  const handleInputChange = (field, value) => {
    setLogoConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          AI-Powered Logo Generator
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Create a professional and unique logo for your brand in seconds using our advanced AI technology
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex border-b">
        <button
          className={`py-3 px-6 font-medium text-sm transition-all ${
            activeTab === 'generator'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('generator')}
        >
          Create Logo
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm transition-all ${
            activeTab === 'gallery'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('gallery')}
        >
          My Logos
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm transition-all ${
            activeTab === 'help'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('help')}
        >
          Design Tips
        </button>
      </div>

      {error && (
        <Alert variant="error" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {activeTab === 'generator' && (
        <Card variant="elevated" className="shadow-lg border-0 rounded-xl overflow-hidden">
          <CardHeader variant="gradient" className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
            <CardTitle className="text-2xl">Logo Generator</CardTitle>
            <p className="text-blue-100 mt-1">Customize your logo settings below</p>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Brand/Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your brand name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={logoConfig.text}
                    onChange={(e) => handleInputChange('text', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Primary Color
                    </label>
                    <select
                      value={logoConfig.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {colorOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Background Color
                    </label>
                    <select
                      value={logoConfig.backgroundColor}
                      onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {colorOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Font Style
                    </label>
                    <select
                      value={logoConfig.font}
                      onChange={(e) => handleInputChange('font', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {fontOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Text Effect
                    </label>
                    <select
                      value={logoConfig.textEffect}
                      onChange={(e) => handleInputChange('textEffect', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {textEffectOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Logo Size
                  </label>
                  <div className="flex items-center space-x-2">
                    {sizeOptions.map((option) => (
                      <label key={option.value} className="flex-1">
                        <input
                          type="radio"
                          name="size"
                          value={option.value}
                          checked={logoConfig.size === option.value}
                          onChange={() => handleInputChange('size', option.value)}
                          className="sr-only"
                        />
                        <div
                          className={`text-center p-2 rounded-lg cursor-pointer border transition-all ${
                            logoConfig.size === option.value
                              ? 'bg-blue-100 border-blue-500'
                              : 'hover:bg-gray-100 border-gray-300'
                          }`}
                        >
                          {option.label}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Additional Instructions (Optional)
                  </label>
                  <textarea
                    placeholder="E.g., include a specific symbol, match with existing branding, etc."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    rows="3"
                    value={logoConfig.additionalInstructions}
                    onChange={(e) => handleInputChange('additionalInstructions', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <div className="text-sm font-medium mb-2 text-gray-700">Logo Preview</div>
                <div className="flex-1 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden min-h-64 hover:shadow-md transition-shadow">
                  {generatedLogo ? (
                    <img src={generatedLogo} alt="Generated Logo" className="max-w-full max-h-64 object-contain" />
                  ) : (
                    <div className="text-center p-8 text-gray-500">
                      <svg className="mx-auto h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                        <circle cx="12" cy="12" r="10" strokeWidth="1" />
                      </svg>
                      <p className="mt-4 text-sm">Your logo will appear here after generation</p>
                    </div>
                  )}
                </div>

                {generatedLogo && (
                  <div className="mt-4 flex space-x-2">
                    <a
                      href={generatedLogo}
                      download="my-logo.png"
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-all font-medium flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </a>
                    <button
                      onClick={handleCopyLogoUrl}
                      className="flex-1 bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 transition-all font-medium flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {copied ? 'Copied!' : 'Copy URL'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>

          <CardDivider />

          <CardActions align="center" className="p-6">
            <button
              onClick={handleGenerate}
              disabled={loading || !logoConfig.text.trim()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-medium shadow-sm hover:shadow-md"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating Logo...
                </div>
              ) : (
                'Generate Logo'
              )}
            </button>
          </CardActions>
        </Card>
      )}

      {activeTab === 'gallery' && (
        <Card variant="elevated" className="shadow-lg border-0 rounded-xl overflow-hidden">
          <CardHeader variant="gradient" className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-6">
            <CardTitle className="text-2xl">My Logos</CardTitle>
            <p className="text-purple-100 mt-1">View and manage your previously generated logos</p>
          </CardHeader>
          <CardContent className="p-6">
            {!user ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Sign in to view your logos</h3>
                <p className="mt-2 text-gray-600">You need to be signed in to access your logo gallery</p>
                <button
                  onClick={() => navigate('/login')}
                  className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No logos found. Generate some logos to see them here!</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'help' && (
        <Card variant="elevated" className="shadow-lg border-0 rounded-xl overflow-hidden">
          <CardHeader variant="gradient" className="bg-gradient-to-r from-green-600 to-teal-500 text-white p-6">
            <CardTitle className="text-2xl">Logo Design Tips</CardTitle>
            <p className="text-green-100 mt-1">Professional guidance to create effective logos</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white shadow rounded-lg p-5 border border-gray-100">
                <h3 className="font-bold text-lg mb-3 text-gray-900">Color Psychology</h3>
                <p className="text-gray-600 mb-3">Colors evoke different emotions and associations:</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center"><div className="w-4 h-4 bg-blue-500 mr-2 rounded"></div>Blue: Trust, professionalism</li>
                  <li className="flex items-center"><div className="w-4 h-4 bg-red-500 mr-2 rounded"></div>Red: Energy, passion</li>
                  <li className="flex items-center"><div className="w-4 h-4 bg-green-500 mr-2 rounded"></div>Green: Growth, nature</li>
                  <li className="flex items-center"><div className="w-4 h-4 bg-yellow-500 mr-2 rounded"></div>Yellow: Optimism, warmth</li>
                  <li className="flex items-center"><div className="w-4 h-4 bg-purple-500 mr-2 rounded"></div>Purple: Creativity, luxury</li>
                </ul>
              </div>
              {/* Other design tip sections could be added here */}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageGenerator;