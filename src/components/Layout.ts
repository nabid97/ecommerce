import React, { FC, ReactNode } from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <div className="page-container">
      <Navigation />
      <div className="content-wrapper py-8">
        {children}
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

export default Layout;