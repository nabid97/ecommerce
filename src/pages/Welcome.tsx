import React from 'react';
import { Link } from 'react-router-dom';

const Welcome: React.FC = () => {
  return (
    <div className="page-container">
      <div className="content-wrapper">
        <header className="text-center py-12">
          <h1 className="text-4xl font-bold">Our Mission</h1>
          <p className="mt-4 text-xl">Connecting suppliers with customers</p>
        </header>
        
        <main className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 my-12">
            <Link 
              to="/clothing"
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition"
            >
              <h2 className="text-2xl font-semibold">Clothing</h2>
            </Link>
            <Link 
              to="/fabric"
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition"
            >
              <h2 className="text-2xl font-semibold">Fabric</h2>
            </Link>
          </div>
        </main>
      </div>

      <footer className="bg-gray-800 text-white py-12 footer">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">About Us</h3>
            <p>Your trusted partner in fabric and clothing wholesale</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Overview</h3>
            <p>Premium quality products for bulk orders</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact</h3>
            <p>Get in touch with our support team</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;