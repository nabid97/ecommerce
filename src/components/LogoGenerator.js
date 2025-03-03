import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardActions, CardDivider } from '../components/ui/card/Card';
import { Alert, AlertDescription } from '../components/ui/alert/Alert';
import { logoApi } from '../api/logoApi';

const LogoGenerator = ({ onLogoGenerate }) => {
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
    { value: 'random', label: 'Random' },
    { value: 'Football', label: 'Football' },
  ];

  // Size options
  const sizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'random', label: 'Random' }
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

      console.log('Generating logo with prompt:', generatePrompt(logoConfig));

      const response = await logoApi.generateLogo(logoConfig);

      if (response?.imageUrl) {
        setGeneratedLogo(response.imageUrl);
        onLogoGenerate?.(response.imageUrl);
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
    <div className="w-full max-w-4xl mx-auto">
      <Card variant="elevated" size="md" className="shadow-lg border-0">
        <CardHeader variant="gradient">
          <CardTitle className="text-white text-2xl">Logo Generator</CardTitle>
          <p className="text-blue-100 mt-1">Create a professional logo for your brand</p>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="error" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

              <CardActions align="center">
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
              </CardActions>
            </div>

            {/* Logo Preview Section */}
            <div className="flex flex-col">
              <div className="text-sm font-medium mb-2 text-gray-700">Logo Preview</div>
              <div className="flex-1 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
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
                        setError('Error loading the generated logo image.');
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
                <div className="mt-4">
                  <CardActions align="between">
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
                      className="flex-1 bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 transition-all font-medium flex items-center justify-center ml-2"
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
                  </CardActions>
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
    </div>
  );
};

export default LogoGenerator;