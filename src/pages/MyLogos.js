import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card/Card';
import { Alert, AlertDescription } from '../components/ui/alert/Alert';
import { logoApi } from '../api/logoApi';
import { useAuth } from '../contexts/AuthContext';

const MyLogos = () => {
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchLogos();
  }, []);

  // In src/pages/MyLogos.js
const fetchLogos = async () => {
  try {
    // Only attempt to fetch if user is logged in
    if (!user) {
      setLogos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    // Make sure you're calling the right API method
    const response = await logoApi.getUserLogos();  // Not getLogos()
    console.log('Fetched logos:', response);
    
    if (response.logos) {
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

  const handleDelete = async (logoId) => {
    try {
      setLoading(true);
      await logoApi.deleteLogo(logoId);
      setSuccess('Logo successfully deleted');
      // Refresh the logos list
      fetchLogos();
    } catch (err) {
      console.error('Error deleting logo:', err);
      setError('Failed to delete logo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && logos.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Logos</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Logos</h1>
        <Link
          to="/image-generator"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Generate New Logo
        </Link>
      </div>

      {error && (
        <Alert className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 text-green-900">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {logos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <svg
              className="w-16 h-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h2 className="text-xl font-semibold mb-2">No logos found</h2>
            <p className="text-gray-600 mb-6">
              You haven't generated any logos yet. Create your first logo now!
            </p>
            <Link
              to="/image-generator"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Generate Logo
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {logos.map((logo) => (
            <Card key={logo._id} className="overflow-hidden">
              <CardHeader className="p-4">
                <CardTitle className="text-lg truncate">{logo.config?.text || "Logo"}</CardTitle>
              </CardHeader>
              <div className="h-48 bg-gray-100 flex items-center justify-center p-4">
              <img
                  src={logo.imageUrl}
                  alt={logo.config?.text || 'Generated Logo'}
                  className="max-h-48 mx-auto object-contain"
                  onLoad={() => console.log("Logo image loaded successfully:", logo.imageUrl)}
                  onError={(e) => {
                    console.error('Failed to load logo image:', logo.imageUrl);
                    e.target.onerror = null; // Prevent infinite error loop
                    e.target.src = '/api/placeholder/200/200?text=Logo+Error';
                  }}
                />
              </div>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">
                  <p><strong>Type:</strong> {logo.type || "Generated"}</p>
                  <p><strong>Created:</strong> {new Date(logo.createdAt).toLocaleDateString()}</p>
                  {logo.config && (
                    <>
                      <p><strong>Style:</strong> {logo.config.style || "N/A"}</p>
                      <p><strong>Font:</strong> {logo.config.font || "N/A"}</p>
                    </>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between p-4 border-t">
                <a
                  href={logo.imageUrl}
                  download="logo.png"
                  className="text-blue-600 hover:text-blue-800"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                </a>
                <button
                  onClick={() => handleDelete(logo._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLogos;