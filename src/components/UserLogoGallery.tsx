import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardActions } from './ui/card/Card';
import { Alert, AlertDescription } from './ui/alert/Alert';
import { logoApi } from '../api/logoApi';
import { useAuth } from '../contexts/AuthContext';
import { cardInteractions } from './ui/card/Card.styles';

interface LogoConfig {
  text?: string;
  color?: string;
  size?: string;
  style?: string;
  font?: string;
  backgroundColor?: string;
  additionalInstructions?: string;
  [key: string]: any;
}

interface Logo {
  _id: string;
  id?: string;
  imageUrl: string;
  config?: LogoConfig;
  type?: 'generated' | 'uploaded';
  createdAt: string;
  updatedAt?: string;
}

const UserLogoGallery: React.FC = () => {
  const { user } = useAuth();
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedLogo, setSelectedLogo] = useState<Logo | null>(null);

  useEffect(() => {
    fetchUserLogos();
  }, []);

  const fetchUserLogos = async (): Promise<void> => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await logoApi.getUserLogos();
      
      if (response && response.logos) {
        setLogos(response.logos);
      } else {
        setLogos([]);
      }
    } catch (err) {
      console.error('Error fetching logos:', err);
      setError('Failed to load your logos. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLogo = async (logoId: string): Promise<void> => {
    try {
      await logoApi.deleteLogo(logoId);
      // Remove the deleted logo from the state
      setLogos(logos.filter(logo => logo._id !== logoId));
      // If the deleted logo was selected, clear the selection
      if (selectedLogo && selectedLogo._id === logoId) {
        setSelectedLogo(null);
      }
    } catch (err) {
      console.error('Error deleting logo:', err);
      setError('Failed to delete logo. Please try again.');
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-6">
          <CardTitle className="text-2xl">My Logos</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Sign in to view your logos</h3>
            <p className="mt-2 text-gray-500">You need to be signed in to access your logo gallery</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-6">
        <CardTitle className="text-2xl">My Logos</CardTitle>
        <p className="text-purple-100 mt-1">All your generated logos are stored in the ecommerce-website-generated-logo-2025 bucket</p>
      </CardHeader>

      <CardContent className="p-6">
        {error && (
          <Alert variant="error" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {logos.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No logos found</h3>
                <p className="mt-2 text-gray-500">You haven't generated any logos yet. Try creating one!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {logos.map(logo => (
                  <div 
                    key={logo._id} 
                    className={`relative border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 group ${
                      selectedLogo?._id === logo._id 
                        ? 'ring-2 ring-purple-500 shadow-lg' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedLogo(logo)}
                  >
                    <div className="aspect-w-1 aspect-h-1 bg-gray-100">
                      <img 
                        src={logo.imageUrl} 
                        alt={logo.config?.text || 'Logo'} 
                        className="object-contain w-full h-full p-2"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/api/placeholder/200/200?text=Image+Error';
                        }}
                      />
                    </div>
                    <div className="p-2 bg-white">
                      <p className="text-sm font-medium truncate">{logo.config?.text || 'Untitled Logo'}</p>
                      <p className="text-xs text-gray-500">{formatDate(logo.createdAt || new Date().toString())}</p>
                    </div>
                    
                    {/* Hover actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-2">
                        <a 
                          href={logo.imageUrl} 
                          download={`${logo.config?.text || 'logo'}.png`}
                          className="p-2 bg-green-600 rounded-full text-white hover:bg-green-700"
                          onClick={(e) => e.stopPropagation()}
                          title="Download"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                        <button 
                          className="p-2 bg-red-600 rounded-full text-white hover:bg-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLogo(logo._id);
                          }}
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Logo details panel */}
            {selectedLogo && (
              <div className="mt-8 p-4 border rounded-lg bg-gray-50">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3 bg-white p-4 rounded-lg border">
                    <img 
                      src={selectedLogo.imageUrl} 
                      alt={selectedLogo.config?.text || 'Selected Logo'} 
                      className="max-w-full h-auto object-contain mx-auto"
                    />
                  </div>
                  
                  <div className="md:w-2/3">
                    <h3 className="font-bold text-lg mb-2">
                      {selectedLogo.config?.text || 'Untitled Logo'}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      Created on {formatDate(selectedLogo.createdAt || new Date().toString())}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm">
                          <span className="font-medium">Style:</span> {selectedLogo.config?.style || 'N/A'}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Font:</span> {selectedLogo.config?.font || 'N/A'}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Size:</span> {selectedLogo.config?.size || 'N/A'}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Stored in:</span> ecommerce-website-generated-logo-2025
                        </div>
                      </div>
                      
                      <div className="flex space-x-4 mt-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: selectedLogo.config?.color || '#000000' }}></div>
                          <span className="text-sm">{selectedLogo.config?.color || '#000000'}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: selectedLogo.config?.backgroundColor || '#FFFFFF' }}></div>
                          <span className="text-sm">{selectedLogo.config?.backgroundColor || '#FFFFFF'}</span>
                        </div>
                      </div>
                      
                      {selectedLogo.config?.additionalInstructions && (
                        <div className="mt-4">
                          <h4 className="font-medium text-sm">Additional Instructions:</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {selectedLogo.config.additionalInstructions}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-3 mt-6">
                      <a 
                        href={selectedLogo.imageUrl} 
                        download={`${selectedLogo.config?.text || 'logo'}.png`}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors inline-flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </a>
                      
                      <button 
                        onClick={() => handleDeleteLogo(selectedLogo._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors inline-flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                      
                      <button 
                        onClick={() => setSelectedLogo(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UserLogoGallery;