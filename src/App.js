
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Welcome from './pages/Welcome';
import Register from './pages/Register';
import Login from './pages/Login';
import Clothing from './pages/Clothing';
import Fabric from './pages/Fabric';
import ImageGenerator from './pages/ImageGenerator';
import Checkout from './pages/Checkout';
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/clothing" element={<Clothing />} />
          <Route path="/fabric" element={<Fabric />} />
          <Route path="/image-generator" element={<ImageGenerator />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
