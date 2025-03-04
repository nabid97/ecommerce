import React, { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card/Card';
import { Alert, AlertDescription } from '../components/ui/alert/Alert';
import { useAuth } from '../contexts/AuthContext';
import LogoGenerator from '../components/LogoGenerator';

const ImageGenerator: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'generator' | 'gallery' | 'help'>('generator');
  const [generatedLogo, setGeneratedLogo] = useState<string | null>(null);

  const handleLogoGenerated = (logoUrl: string): void => {
    setGeneratedLogo(logoUrl);
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
        <LogoGenerator onLogoGenerate={handleLogoGenerated} />
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