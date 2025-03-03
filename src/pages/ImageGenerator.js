import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDivider, CardActions } from '../components/ui/card/Card';
import { Alert, AlertDescription } from '../components/ui/alert/Alert';
import { logoApi } from '../api/logoApi';
import { useAuth } from '../contexts/AuthContext';
import { cardInteractions } from '../components/ui/card/Card.styles';

const ImageGenerator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [logoConfig, setLogoConfig] = useState({
    text: '',
    color: '#3B82F6',
    backgroundColor: '#FFFFFF',
    size: 'medium',
    style: 'modern',
    font: 'Random',
    textEffect: 'normal',
    additionalInstructions: '',
    primaryColorMode: 'preset',
    customPrimaryColor: '',
    customPrimaryHex: '#3B82F6',
    backgroundColorMode: 'preset',
    customBackgroundColor: '',
    customBackgroundHex: '#FFFFFF'
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

  const sizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'random', label: 'Random' }
  ];

  const presetColors = [
     { label: 'Red', value: 'Red' },
    { label: 'Green', value: 'Green' },
    { label: 'Blue', value: 'Blue' },
    { label: 'Yellow', value: 'Yellow' },
    { label: 'Purple', value: 'Purple' },
    { label: 'Orange', value: 'Orange' },
    { label: 'Pink', value: 'Pink' },
    { label: 'Brown', value: 'Brown' },
    { label: 'Gray', value: 'Gray' },
    { label: 'Black', value: 'Black' },
    { label: 'White', value: 'White' }
  ];

  const customColors = [
    { name: 'Sky Blue', hex: '#87CEEB' },
    { name: 'Coral', hex: '#FF7F50' },
    { name: 'Mint Green', hex: '#98FB98' },
    { name: 'Lavender', hex: '#E6E6FA' },
    { name: 'Slate Gray', hex: '#708090' },
    { name: 'Peach', hex: '#FFDAB9' },
    { name: 'Turquoise', hex: '#40E0D0' },
    { name: 'Crimson', hex: '#DC143C' },
    { name: 'Indigo', hex: '#4B0082' },
    { name: 'Forest Green', hex: '#228B22' },
    { name: 'Ruby Red', hex: '#E0115F' },
    { name: 'Royal Blue', hex: '#4169E1' }
  ];

  const textEffectOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'bold', label: 'Bold' },
    { value: 'italic', label: 'Italic' },
    { value: 'underline', label: 'Underline' },
    { value: 'modern', label: 'Modern' },
    { value: 'football', label: 'Football' },
    { value: 'random', label: 'Random' },
  ];

  const handleGenerate = async () => {
    if (!logoConfig.text.trim()) {
      setError('Please enter logo text');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setCopied(false);
      
      const finalConfig = {
        ...logoConfig,
        color: logoConfig.primaryColorMode === 'custom' ? logoConfig.customPrimaryHex : logoConfig.color,
        backgroundColor: logoConfig.backgroundColorMode === 'custom' ? logoConfig.customBackgroundHex : logoConfig.backgroundColor
      };
      
      const response = await logoApi.generateLogo(finalConfig);
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

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Primary Color
                  </label>
                  <div className="flex mb-4 space-x-2">
                    <button
                      onClick={() => handleInputChange('primaryColorMode', 'preset')}
                      className={`flex-1 py-2 px-4 text-sm rounded-lg transition-colors duration-200 ${
                        logoConfig.primaryColorMode === 'preset' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      Preset Colors
                    </button>
                    <button
                      onClick={() => handleInputChange('primaryColorMode', 'custom')}
                      className={`flex-1 py-2 px-4 text-sm rounded-lg transition-colors duration-200 ${
                        logoConfig.primaryColorMode === 'custom' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      Custom Color
                    </button>
                  </div>

                  {logoConfig.primaryColorMode === 'preset' ? (
                    <select
                      value={logoConfig.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out appearance-none bg-white text-gray-700 cursor-pointer hover:border-blue-400"
                      style={{
                        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='5' viewBox='0 0 10 5'><path fill='none' stroke='%233B82F6' stroke-width='2' d='M0 0l5 5 5-5'/></svg>")`,
                        backgroundPosition: 'right 0.75rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '10px 5px',
                      }}
                    >
                      {presetColors.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <input
                          type="color"
                          value={logoConfig.customPrimaryHex || '#3B82F6'}
                          onChange={(e) => handleInputChange('customPrimaryHex', e.target.value)}
                          className="w-16 h-16 rounded-full border-0 cursor-pointer"
                        />
                        <input
                          type="text"
                          placeholder="Custom color name (e.g., Sky Blue)"
                          value={logoConfig.customPrimaryColor || ''}
                          onChange={(e) => setLogoConfig({
                            ...logoConfig,
                            customPrimaryColor: e.target.value
                          })}
                          className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {customColors.map(color => (
                          <div
                            key={color.name}
                            onClick={() => setLogoConfig({
                              ...logoConfig,
                              customPrimaryHex: color.hex,
                              customPrimaryColor: color.name
                            })}
                            className={`${cardInteractions.selectable} h-8 w-full rounded-full relative flex items-center justify-center ${
                              logoConfig.customPrimaryHex === color.hex ? 'ring-2 ring-blue-500' : ''
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          >
                            {logoConfig.customPrimaryHex === color.hex && (
                              <svg className="w-4 h-4 text-white drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                            <span className="absolute text-xs text-white font-medium opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black bg-opacity-50 rounded px-1 py-0.5">
                              {color.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-3 flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Selected:</span>
                    <div
                      className="h-6 w-6 rounded-full border transition-all duration-200"
                      style={{ 
                        backgroundColor: logoConfig.primaryColorMode === 'custom' 
                          ? logoConfig.customPrimaryHex 
                          : logoConfig.color 
                      }}
                    />
                    <span className="text-sm">
                      {logoConfig.primaryColorMode === 'custom' 
                        ? (logoConfig.customPrimaryColor || 'Custom') 
                        : presetColors.find(c => c.value === logoConfig.color)?.label || logoConfig.color}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Background Color
                  </label>
                  <div className="flex mb-4 space-x-2">
                    <button
                      onClick={() => handleInputChange('backgroundColorMode', 'preset')}
                      className={`flex-1 py-2 px-4 text-sm rounded-lg transition-colors duration-200 ${
                        logoConfig.backgroundColorMode === 'preset' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      Preset Colors
                    </button>
                    <button
                      onClick={() => handleInputChange('backgroundColorMode', 'custom')}
                      className={`flex-1 py-2 px-4 text-sm rounded-lg transition-colors duration-200 ${
                        logoConfig.backgroundColorMode === 'custom' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      Custom Color
                    </button>
                  </div>

                  {logoConfig.backgroundColorMode === 'preset' ? (
                    <select
                      value={logoConfig.backgroundColor}
                      onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out appearance-none bg-white text-gray-700 cursor-pointer hover:border-blue-400"
                      style={{
                        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='5' viewBox='0 0 10 5'><path fill='none' stroke='%233B82F6' stroke-width='2' d='M0 0l5 5 5-5'/></svg>")`,
                        backgroundPosition: 'right 0.75rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '10px 5px',
                      }}
                    >
                      {presetColors.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <input
                          type="color"
                          value={logoConfig.customBackgroundHex || '#FFFFFF'}
                          onChange={(e) => handleInputChange('customBackgroundHex', e.target.value)}
                          className="w-16 h-16 rounded-full border-0 cursor-pointer"
                        />
                        <input
                          type="text"
                          placeholder="Custom color name (e.g., Off White)"
                          value={logoConfig.customBackgroundColor || ''}
                          onChange={(e) => setLogoConfig({
                            ...logoConfig,
                            customBackgroundColor: e.target.value
                          })}
                          className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {customColors.map(color => (
                          <div
                            key={color.name}
                            onClick={() => setLogoConfig({
                              ...logoConfig,
                              customBackgroundHex: color.hex,
                              customBackgroundColor: color.name
                            })}
                            className={`${cardInteractions.selectable} h-8 w-full rounded-full relative flex items-center justify-center ${
                              logoConfig.customBackgroundHex === color.hex ? 'ring-2 ring-blue-500' : ''
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          >
                            {logoConfig.customBackgroundHex === color.hex && (
                              <svg className="w-4 h-4 text-white drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                            <span className="absolute text-xs text-white font-medium opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black bg-opacity-50 rounded px-1 py-0.5">
                              {color.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-3 flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Selected:</span>
                    <div
                      className="h-6 w-6 rounded-full border transition-all duration-200"
                      style={{ 
                        backgroundColor: logoConfig.backgroundColorMode === 'custom' 
                          ? logoConfig.customBackgroundHex 
                          : logoConfig.backgroundColor 
                      }}
                    />
                    <span className="text-sm">
                      {logoConfig.backgroundColorMode === 'custom' 
                        ? (logoConfig.customBackgroundColor || 'Custom') 
                        : presetColors.find(c => c.value === logoConfig.backgroundColor)?.label || logoConfig.backgroundColor}
                    </span>
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageGenerator;