// src/components/ClothingVisualizer.js
import React, { useState } from 'react';

const ClothingVisualizer = ({ 
  clothingType = 't-shirt', 
  color = 'white', 
  logoPosition = 'front-center',
  logoSize = 'medium',
  logoImage = null
}) => {
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Convert color name to hex
  const getHexFromColorName = (colorName) => {
    const colorMap = {
      'white': '#FFFFFF',
      'black': '#000000',
      'red': '#FF0000',
      'blue': '#0000FF',
      'navy': '#000080',
      'green': '#008000',
      'yellow': '#FFFF00',
      'purple': '#800080',
      'gray': '#808080',
      'orange': '#FFA500',
      'pink': '#FFC0CB',
      'brown': '#8B4513'
    };
    
    // If it's a hex code already or not in our map, return as is
    if (colorName.startsWith('#')) return colorName;
    return colorMap[colorName.toLowerCase()] || '#FFFFFF';
  };
  
  // Get logo position coordinates
  const getLogoPosition = (position, baseWidth, baseHeight) => {
    const positions = {
      'front-center': { x: baseWidth / 2, y: baseHeight / 2.5 },
      'front-left': { x: baseWidth / 3, y: baseHeight / 3 },
      'back-center': { x: baseWidth / 2, y: baseHeight / 2.5 },
      'sleeve': { x: baseWidth * 0.8, y: baseHeight / 2.5 }
    };
    
    return positions[position] || positions['front-center'];
  };
  
  // Get logo dimensions based on size
  const getLogoDimensions = (size, baseWidth) => {
    const sizes = {
      'small': baseWidth * 0.15,
      'medium': baseWidth * 0.25,
      'large': baseWidth * 0.35
    };
    
    const width = sizes[size] || sizes.medium;
    return { width, height: width };
  };
  
  // Determine clothing template path
  const getClothingTemplate = (type) => {
    // In a real app, you would have SVG templates for each clothing type
    // For this example, we'll use simple SVG shapes
    
    if (type === 'hoodie') {
      return (
        <path 
          d="M50,50 L200,50 L230,120 L250,200 L250,300 L50,300 L50,200 L70,120 Z" 
          strokeWidth="2"
        />
      );
    } else if (type === 'polo') {
      return (
        <path 
          d="M80,50 L220,50 L240,100 L240,300 L60,300 L60,100 Z" 
          strokeWidth="2"
        />
      );
    } else { // default t-shirt
      return (
        <path 
          d="M80,50 L220,50 L240,100 L240,300 L60,300 L60,100 Z" 
          strokeWidth="2"
        />
      );
    }
  };
  
  // Base dimensions
  const baseWidth = 300;
  const baseHeight = 350;
  
  // Logo positioning and sizing
  const logoPos = getLogoPosition(logoPosition, baseWidth, baseHeight);
  const logoDim = getLogoDimensions(logoSize, baseWidth);
  
  // Color
  const colorHex = getHexFromColorName(color);
  
  // For darker colors, use a white stroke for contrast
  const strokeColor = ['#000000', '#000080', '#0000FF', '#800080', '#8B4513'].includes(colorHex) ? '#FFFFFF' : '#000000';

  return (
    <div className="relative w-full flex justify-center items-center">
      {/* Main SVG clothing visualization */}
      <svg 
        width="100%" 
        height="350" 
        viewBox={`0 0 ${baseWidth} ${baseHeight}`} 
        className="border rounded bg-white"
      >
        {/* Clothing shape */}
        <g stroke={strokeColor} fill={colorHex}>
          {getClothingTemplate(clothingType)}
        </g>
        
        {/* Collar for polo or t-shirt */}
        {(clothingType === 'polo' || clothingType === 't-shirt') && (
          <path 
            d="M120,50 L180,50 L170,80 L150,90 L130,80 Z" 
            fill={colorHex === '#FFFFFF' ? '#F8F8F8' : '#000000'} 
            fillOpacity="0.1"
            stroke={strokeColor}
          />
        )}
        
        {/* Hood for hoodie */}
        {clothingType === 'hoodie' && (
          <ellipse 
            cx={baseWidth / 2} 
            cy="45" 
            rx="70" 
            ry="25" 
            fill={colorHex === '#FFFFFF' ? '#F8F8F8' : '#000000'} 
            fillOpacity="0.1"
            stroke={strokeColor}
          />
        )}
        
        {/* Sleeves */}
        <path 
          d={clothingType === 'hoodie' 
            ? "M50,140 L20,180 L30,200 L60,160 Z M250,140 L280,180 L270,200 L240,160 Z" 
            : "M60,100 L20,150 L30,180 L70,110 Z M240,100 L280,150 L270,180 L230,110 Z"}
          fill={colorHex}
          stroke={strokeColor}
        />
        
        {/* Text label for the clothing type */}
        <text
          x={baseWidth / 2}
          y={baseHeight - 20}
          textAnchor="middle"
          className="text-xs"
          stroke="none"
          fill={strokeColor}
        >
          {clothingType.toUpperCase()}
        </text>
        
        {/* Logo placement */}
        {logoImage && (
          <image
            x={logoPos.x - (logoDim.width / 2)}
            y={logoPos.y - (logoDim.height / 2)}
            width={logoDim.width}
            height={logoDim.height}
            href={logoImage}
            preserveAspectRatio="xMidYMid meet"
            onLoad={() => setLogoLoaded(true)}
            onError={() => setError(true)}
          />
        )}
        
        {/* If no logo provided, show placeholder */}
        {!logoImage && (
          <rect
            x={logoPos.x - (logoDim.width / 2)}
            y={logoPos.y - (logoDim.height / 2)}
            width={logoDim.width}
            height={logoDim.height}
            fill="none"
            stroke="#999"
            strokeDasharray="5,5"
          />
        )}
      </svg>
      
      {/* Loading indicators */}
      {logoImage && !logoLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-100 text-red-800 text-xs p-1 text-center">
          Failed to load logo image
        </div>
      )}
    </div>
  );
};

export default ClothingVisualizer;