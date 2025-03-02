import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card/Card';
import { Alert, AlertDescription } from '../components/ui/alert/Alert';
import { logoApi } from '../api/logoApi';
import { useAuth } from '../contexts/AuthContext';

const ImageGenerator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [logoConfig, setLogoConfig] = useState({
    text: '',
    color: '#3B82F6', // Default to a nice blue color
    backgroundColor: '#FFFFFF',
    size: 'medium',
    style: 'modern',
    font: 'Arial',
    additionalInstructions: ''
  });

  const [generatedLogo, setGeneratedLogo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('generator');

  // Font options
  const fontOptions = [
    { value: 'Arial', label: 'Arial (Sans-serif)' },
    { value: 'Helvetica', label: 'Helvetica (Sans-serif)' },
    { value: 'Times New Roman', label: 'Times New Roman (Serif)' },
    { value: 'Georgia', label: 'Georgia (Serif)' },
    { value: 'Verdana', label: 'Verdana (Sans-serif)' },
    { value: 'Futura', label: 'Futura (Modern)' },
    { value: 'Garamond', label: 'Garamond (Classic)' },
    { value: 'Montserrat', label: 'Montserrat (Contemporary)' },
    { value: 'Random', label: 'Random' },
    
  ];

  // Style options
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
    { value: 'Football', label: 'Football' },
    
  ];

  // Size options
  const sizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'random', label: 'Random' },
  ];

  // Generate detailed prompt for Stability AI
  const generatePrompt = (config) => {
    return `Design a professional ${config.style} logo that strictly follows these specifications. The final image should ONLY contain the logo design and no additional text, labels, or annotations:
  - Logo Text: "${config.text}"
  - Font: ${config.font}
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

      console.log('Generating logo with config:', logoConfig);
      console.log('Prompt for Stability AI:', generatePrompt(logoConfig));

      const response = await logoApi.generateLogo(logoConfig);

      console.log('Logo generation response:', response);

      if (response?.imageUrl) {
        // Verify the URL is valid before setting it
        if (response.imageUrl.startsWith('data:image')) {
          // Direct base64 data URL - can be used as is
          setGeneratedLogo(response.imageUrl);
        }
        else if (response.imageUrl.startsWith('/')) {
          // Relative URL from server - prepend with base URL
          const baseUrl = window.location.origin;
          const fullUrl = `${baseUrl}${response.imageUrl}`;
          console.log('Converting relative URL to full URL:', fullUrl);
          setGeneratedLogo(fullUrl);
        }
        else {
          // External URL - validate
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
        }
      } else {
        throw new Error('Failed to generate logo');
      }

    } catch (err) {
      console.error('Detailed logo generation error:', err);
      
      // Handle different types of errors
      if (err.response) {
        setError(err.response.data.message || 'Failed to generate logo');
      } else {
        setError(err.message || 'An unexpected error occurred');
      }
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
        .catch(err => {
          console.error('Failed to copy:', err);
        });
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

      {/* Logo Generator Main Content */}
      {activeTab === 'generator' && (
        <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
            <CardTitle className="text-2xl">Logo Generator</CardTitle>
            <p className="text-blue-100 mt-1">Customize your logo settings below</p>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Logo Configuration Form */}
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
                    <div className="flex">
                      <input
                        type="color"
                        value={logoConfig.color}
                        onChange={(e) => handleInputChange('color', e.target.value)}
                        className="w-12 h-10 border rounded-l-lg p-1 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={logoConfig.color}
                        onChange={(e) => handleInputChange('color', e.target.value)}
                        className="flex-1 p-2 border-t border-r border-b rounded-r-lg"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Background Color
                    </label>
                    <div className="flex">
                      <input
                        type="color"
                        value={logoConfig.backgroundColor}
                        onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                        className="w-12 h-10 border rounded-l-lg p-1 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={logoConfig.backgroundColor}
                        onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                        className="flex-1 p-2 border-t border-r border-b rounded-r-lg"
                      />
                    </div>
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
                      {fontOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Logo Style
                    </label>
                    <select
                      value={logoConfig.style}
                      onChange={(e) => handleInputChange('style', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {styleOptions.map(option => (
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
                    {sizeOptions.map(option => (
                      <label key={option.value} className="flex-1">
                        <input
                          type="radio"
                          name="size"
                          value={option.value}
                          checked={logoConfig.size === option.value}
                          onChange={() => handleInputChange('size', option.value)}
                          className="sr-only"
                        />
                        <div className={`text-center p-2 rounded-lg cursor-pointer border transition-all ${
                          logoConfig.size === option.value 
                            ? 'bg-blue-100 border-blue-500' 
                            : 'hover:bg-gray-100 border-gray-300'
                        }`}>
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

                <button
                  onClick={handleGenerate}
                  disabled={loading || !logoConfig.text.trim()}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-medium shadow-sm"
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
              </div>

              {/* Logo Preview Section */}
              <div className="flex flex-col">
                <div className="text-sm font-medium mb-2 text-gray-700">Logo Preview</div>
                <div className="flex-1 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden min-h-64">
                  {generatedLogo ? (
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                      <img 
                        src={generatedLogo} 
                        alt="Generated Logo" 
                        className="max-w-full max-h-64 object-contain"
                        onError={(e) => {
                          console.error('Image failed to load:', generatedLogo);
                          e.target.onerror = null; 
                          e.target.src = '/api/placeholder/400/320';
                          setError('Error loading the generated logo image. Using placeholder instead.');
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-center p-8 text-gray-500">
                      <svg 
                        className="mx-auto h-20 w-20 text-gray-400" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={1} 
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" 
                        />
                        <circle cx="12" cy="12" r="10" strokeWidth="1" />
                      </svg>
                      <p className="mt-4 text-sm">
                        Your logo will appear here after generation
                      </p>
                    </div>
                  )}
                </div>

                {/* Download/Copy Action Buttons */}
                {generatedLogo && (
                  <div className="mt-4 flex space-x-2">
                    <a 
                      href={generatedLogo}
                      download="my-logo.png"
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-all text-center font-medium flex items-center justify-center"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg 
                        className="w-5 h-5 mr-2" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
                        />
                      </svg>
                      Download
                    </a>
                    <button
                      onClick={handleCopyLogoUrl}
                      className="flex-1 bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 transition-all font-medium flex items-center justify-center"
                    >
                      <svg 
                        className="w-5 h-5 mr-2" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
                        />
                      </svg>
                      {copied ? 'Copied!' : 'Copy URL'}
                    </button>
                  </div>
                )}

                {/* Tips Section */}
                <div className="mt-4 bg-blue-50 border border-blue-100 p-3 rounded-lg">
                  <h3 className="text-sm font-semibold text-blue-800">Logo Design Tips</h3>
                  <ul className="mt-1 text-xs text-blue-700 space-y-1 list-disc list-inside">
                    <li>Use contrasting colors for better visibility</li>
                    <li>Keep the design simple and memorable</li>
                    <li>Ensure text is legible at different sizes</li>
                    <li>Match the style to your brand personality</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Logos Gallery */}
      {activeTab === 'gallery' && (
        <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-6">
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
                <p className="mt-2 text-gray-500">You need to be signed in to access your logo gallery</p>
                <div className="mt-6">
                  <button 
                    onClick={() => navigate('/login')} 
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No logos found. Generate some logos to see them here!</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Design Tips */}
      {activeTab === 'help' && (
        <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-600 to-teal-500 text-white p-6">
            <CardTitle className="text-2xl">Logo Design Tips</CardTitle>
            <p className="text-green-100 mt-1">Professional guidance to create effective logos</p>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white shadow rounded-lg p-5 border border-gray-100">
                <h3 className="font-bold text-lg mb-3 text-gray-900">Color Psychology</h3>
                <p className="text-gray-600 mb-3">Colors evoke different emotions and associations:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 mr-2 rounded"></div>
                    <span>Blue: Trust, professionalism, calmness</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 mr-2 rounded"></div>
                    <span>Red: Energy, passion, urgency</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 mr-2 rounded"></div>
                    <span>Green: Growth, health, nature</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-500 mr-2 rounded"></div>
                    <span>Yellow: Optimism, clarity, warmth</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-4 h-4 bg-purple-500 mr-2 rounded"></div>
                    <span>Purple: Creativity, luxury, wisdom</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white shadow rounded-lg p-5 border border-gray-100">
                <h3 className="font-bold text-lg mb-3 text-gray-900">Font Selection</h3>
                <p className="text-gray-600 mb-3">Font styles communicate different brand attributes:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="font-sans font-bold mr-2">Sans-serif:</span>
                    <span>Modern, clean, straightforward (Arial, Helvetica)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-serif font-bold mr-2">Serif:</span>
                    <span>Traditional, respectable, established (Times New Roman)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2" style={{fontFamily: 'cursive'}}>Script:</span>
                    <span>Elegant, creative, personal</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2" style={{fontFamily: 'monospace'}}>Monospace:</span>
                    <span>Technical, precise, structured</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white shadow rounded-lg p-5 border border-gray-100">
                <h3 className="font-bold text-lg mb-3 text-gray-900">Design Principles</h3>
                <ul className="space-y-2 text-sm">
                  <li><strong>Simplicity:</strong> Simple logos are more recognizable and versatile</li>
                  <li><strong>Scalability:</strong> Ensure your logo looks good at any size</li>
                  <li><strong>Memorability:</strong> Aim for distinctiveness that stands out</li>
                  <li><strong>Timelessness:</strong> Avoid trends that will quickly date your logo</li>
                  <li><strong>Versatility:</strong> Works well across different media and backgrounds</li>
                </ul>
              </div>

              <div className="bg-white shadow rounded-lg p-5 border border-gray-100">
                <h3 className="font-bold text-lg mb-3 text-gray-900">Common Mistakes to Avoid</h3>
                <ul className="space-y-2 text-sm">
                  <li><strong>Too complex:</strong> Using too many elements or details</li>
                  <li><strong>Poor contrast:</strong> Text that's hard to read against background</li>
                  <li><strong>Generic imagery:</strong> Using overused symbols or concepts</li>
                  <li><strong>Following trends:</strong> Creating a logo that will quickly look dated</li>
                  <li><strong>Incorrect file formats:</strong> Not having proper vector versions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageGenerator;