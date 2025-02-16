import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold">Fabric Store</span>
            </Link>
          </div>
          <div className="flex items-center">
            <Link to="/fabric" className="px-3 py-2 rounded-md text-gray-700 hover:text-gray-900">
              Fabrics
            </Link>
            <Link to="/cart" className="px-3 py-2 rounded-md text-gray-700 hover:text-gray-900">
              Cart
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;