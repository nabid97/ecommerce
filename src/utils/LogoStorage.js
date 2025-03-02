// src/server/utils/LogoStorage.js
const AWS = require('aws-sdk');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Create directories for local storage fallback
const createDirectories = () => {
  const baseDir = path.join(__dirname, '../../uploads');
  const logosDir = path.join(baseDir, 'logos');
  const generatedDir = path.join(logosDir, 'generated');
  const uploadedDir = path.join(logosDir, 'uploaded');
  
  console.log('Creating logo storage directories:');
  console.log('- Base directory:', baseDir);
  console.log('- Logos directory:', logosDir);
  
  // Create directories if they don't exist
  if (!fs.existsSync(baseDir)) {
    console.log('Creating base directory');
    fs.mkdirSync(baseDir, { recursive: true });
  }
  if (!fs.existsSync(logosDir)) {
    console.log('Creating logos directory');
    fs.mkdirSync(logosDir, { recursive: true });
  }
  if (!fs.existsSync(generatedDir)) {
    console.log('Creating generated logos directory');
    fs.mkdirSync(generatedDir, { recursive: true });
  }
  if (!fs.existsSync(uploadedDir)) {
    console.log('Creating uploaded logos directory');
    fs.mkdirSync(uploadedDir, { recursive: true });
  }
  
  return { baseDir, logosDir, generatedDir, uploadedDir };
};

// Create necessary directories
const directories = createDirectories();

// Configure AWS S3
let s3;
try {
  if (process.env.AWS_ACCESS_KEY_ID && 
      process.env.AWS_SECRET_ACCESS_KEY && 
      process.env.AWS_REGION) {
    
    s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
      signatureVersion: 'v4' // Ensure latest signature version
    });
    
    console.log('✓ AWS S3 client initialized for LogoStorage');
  } else {
    console.log('⚠️ AWS S3 credentials not found, using local storage for logos');
    s3 = null;
  }
} catch (error) {
  console.error('Error initializing AWS S3:', error.message);
  s3 = null;
}

// Generate unique filename for logo
const generateLogoFilename = (companyName, type) => {
  const timestamp = new Date().getTime();
  const sanitizedCompanyName = (companyName || 'logo')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-');
  return `${sanitizedCompanyName}-${timestamp}-${type || 'logo'}.png`;
};

// Generate a pre-signed URL for accessing the uploaded file
const generatePreSignedUrl = async (bucket, key, expiresIn = 31536000) => { // Default to 1 year
  if (!s3) {
    throw new Error('S3 is not configured');
  }
  
  try {
    return await s3.getSignedUrl('getObject', {
      Bucket: bucket,
      Key: key,
      Expires: expiresIn // URL valid for extended period
    });
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    throw new Error('Failed to generate file access URL');
  }
};

// Save logo to storage (S3 or local file system)
const saveLogo = async (imageUrl, config, userId = null) => {
  try {
    let buffer;
    
    // Handle data URLs and regular URLs differently
    if (imageUrl.startsWith('data:')) {
      // Extract the base64 data from the data URL
      const matches = imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error('Invalid data URL format');
      }
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      // Download image from source URL
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      buffer = Buffer.from(response.data, 'binary');
    }

    // Generate filename
    const filename = generateLogoFilename(config.text || 'logo', config.style || 'standard');
    
    // Use S3 if available
    if (s3 && process.env.AWS_S3_BUCKET) {
      const key = `logos/generated/${filename}`;
      
      // Upload to S3
      const uploadResult = await s3.upload({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: 'image/png',
        Metadata: {
          userId: userId ? userId.toString() : 'system',
          companyName: config.text || '',
          style: config.style || '',
          color: config.color || '',
          size: config.size || '',
          font: config.font || '',
          generatedDate: new Date().toISOString()
        }
      }).promise();

      // Return the S3 URL
      return {
        url: uploadResult.Location,
        filename: filename,
        path: `logos/generated/${filename}`
      };
    } else {
      // Fall back to local file storage
      const filePath = path.join(directories.generatedDir, filename);
      fs.writeFileSync(filePath, buffer);
      
      // Return local URL
      return {
        url: `/uploads/logos/generated/${filename}`,
        filename: filename,
        path: filePath
      };
    }
  } catch (error) {
    console.error('Error saving logo:', error);
    throw new Error('Failed to save logo: ' + error.message);
  }
};

// Save uploaded logo
const saveUploadedLogo = async (file, companyName = '', userId = null) => {
  try {
    let buffer;
    let contentType;
    
    // Handle different file input formats
    if (Buffer.isBuffer(file)) {
      buffer = file;
      contentType = 'application/octet-stream';
    } else if (file.buffer) {
      // Handle multer file object
      buffer = file.buffer;
      contentType = file.mimetype;
    } else if (typeof file === 'string' && file.startsWith('data:')) {
      // Handle data URL
      const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error('Invalid data URL format');
      }
      contentType = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      throw new Error('Unsupported file format');
    }

    const filename = generateLogoFilename(companyName || 'upload', 'uploaded');
    
    // Use S3 if available
    if (s3 && process.env.AWS_S3_BUCKET) {
      const key = `logos/uploaded/${filename}`;
      
      const uploadResult = await s3.upload({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: {
          userId: userId ? userId.toString() : 'system',
          companyName: companyName || 'unknown',
          uploadDate: new Date().toISOString()
        }
      }).promise();

      return {
        url: uploadResult.Location,
        filename: filename,
        path: `logos/uploaded/${filename}`
      };
    } else {
      // Fall back to local file storage
      const filePath = path.join(directories.uploadedDir, filename);
      fs.writeFileSync(filePath, buffer);
      
      // Return local URL
      return {
        url: `/uploads/logos/uploaded/${filename}`,
        filename: filename,
        path: filePath
      };
    }
  } catch (error) {
    console.error('Error saving uploaded logo:', error);
    throw new Error('Failed to save uploaded logo: ' + error.message);
  }
};

// Export functions
module.exports = {
  saveLogo,
  saveUploadedLogo,
  generateLogoFilename,
  generatePreSignedUrl
};