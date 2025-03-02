import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md" role="navigation">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold">Fabric Store</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/fabric"
              className="px-3 py-2 rounded-md text-gray-700 hover:text-gray-900"
              data-testid="fabrics-link"
            >
              Fabrics
            </Link>
            <Link
              to="/clothing"
              className="px-3 py-2 rounded-md text-gray-700 hover:text-gray-900"
              data-testid="clothing-link"
            >
              Clothing
            </Link>
            <Link
              to="/image-generator"
              className="px-3 py-2 rounded-md text-gray-700 hover:text-gray-900"
              data-testid="logo-generator-link"
            >
              Logo Generator
            </Link>
            <Link
              to="/cart"
              className="px-3 py-2 rounded-md text-gray-700 hover:text-gray-900"
              data-testid="cart-link"
            >
              Cart
            </Link>
            {user ? (
              <button
                onClick={logout}
                className="px-3 py-2 rounded-md text-gray-700 hover:text-gray-900"
                data-testid="logout-button"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-gray-700 hover:text-gray-900"
                  data-testid="login-link"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  data-testid="register-link"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;