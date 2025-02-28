import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const ClothingVisualizer = ({ 
  clothingType, 
  color, 
  logoImage, 
  logoPosition, 
  logoSize 
}) => {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    setIsLoading(true);
    
    // Get the container dimensions
    const width = containerRef.current.clientWidth;
    const height = width * 0.8; // Maintain aspect ratio
    
    // 1. Initialize Three.js renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    
    // 2. Create scene and camera
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 0.1, 1000);
    camera.position.z = 10;
    
    // 3. Load clothing template based on type
    const clothingTextures = {
      't-shirt': '/templates/tshirt_template.jpg',
      'hoodie': '/templates/hoodie_template.jpg',
      'polo': '/templates/polo_template.jpg',
      // Add more as needed
    };
    
    const templatePath = clothingTextures[clothingType] || clothingTextures['t-shirt'];
    const clothingTextureLoader = new THREE.TextureLoader();
    
    const clothingPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ transparent: true })
    );
    
    // 4. Load the template and apply color transform
    clothingTextureLoader.load(templatePath, texture => {
      // Apply the clothing texture
      clothingPlane.material.map = texture;
      
      // Apply color transform (this is a simplified version)
      if (color !== 'white') {
        clothingPlane.material.color = new THREE.Color(getHexFromColorName(color));
      }
      
      scene.add(clothingPlane);
      
      // 5. Add logo if available
      if (logoImage) {
        const logoTextureLoader = new THREE.TextureLoader();
        
        // Convert logo position to coordinates
        const logoCoordinates = getLogoCoordinates(logoPosition, width, height);
        const logoScale = getLogoScale(logoSize, width);
        
        logoTextureLoader.load(logoImage, logoTexture => {
          // Calculate aspect ratio to maintain logo proportions
          const logoAspect = logoTexture.image.width / logoTexture.image.height;
          
          // Create logo plane with proper proportions
          const logoWidth = logoScale;
          const logoHeight = logoScale / logoAspect;
          
          const logoPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(logoWidth, logoHeight),
            new THREE.MeshBasicMaterial({ 
              map: logoTexture,
              transparent: true
            })
          );
          
          // Position the logo
          logoPlane.position.set(
            logoCoordinates.x, 
            logoCoordinates.y, 
            0.1 // Slightly in front of clothing
          );
          
          scene.add(logoPlane);
          setIsLoading(false);
          
          // Render the scene
          renderer.render(scene, camera);
        });
      } else {
        setIsLoading(false);
        renderer.render(scene, camera);
      }
    });
    
    // Handle resizing
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = newWidth * 0.8;
      
      renderer.setSize(newWidth, newHeight);
      camera.left = -newWidth / 2;
      camera.right = newWidth / 2;
      camera.top = newHeight / 2;
      camera.bottom = -newHeight / 2;
      camera.updateProjectionMatrix();
      
      renderer.render(scene, camera);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [clothingType, color, logoImage, logoPosition, logoSize]);
  
  return (
    <div className="relative">
      <div ref={containerRef} className="w-full bg-white rounded shadow-sm"/>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
};

// Helper functions
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
    // Add more colors as needed
  };
  
  return colorMap[colorName] || colorName; // Return the color name if not found (might be hex already)
};

const getLogoCoordinates = (position, width, height) => {
  // Convert logo position strings to x,y coordinates
  const positionMap = {
    'front-center': { x: 0, y: 0 },
    'front-left': { x: -width/4, y: 0 },
    'back-center': { x: 0, y: -height/6 },
    'sleeve': { x: width/3, y: 0 }
  };
  
  return positionMap[position] || positionMap['front-center'];
};

const getLogoScale = (size, containerWidth) => {
  const scales = {
    'small': containerWidth * 0.15,
    'medium': containerWidth * 0.25,
    'large': containerWidth * 0.35
  };
  
  return scales[size] || scales.medium;
};

export default ClothingVisualizer;