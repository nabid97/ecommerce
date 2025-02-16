import AWS from 'aws-sdk';
import axios from 'axios';
import path from 'path';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Generate unique filename for logo
const generateLogoFilename = (companyName, type) => {
  const timestamp = new Date().getTime();
  const sanitizedCompanyName = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-');
  return `${sanitizedCompanyName}-${timestamp}-${type}.png`;
};

// Save logo to S3
export const saveLogo = async (imageUrl, config) => {
  try {
    // Download image from DeepSeek URL
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    // Generate filename
    const filename = generateLogoFilename(config.text, config.style);
    
    // Upload to S3
    const uploadResult = await s3.upload({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `logos/generated/${filename}`,
      Body: buffer,
      ContentType: 'image/png',
      Metadata: {
        companyName: config.text,
        style: config.style,
        color: config.color,
        size: config.size,
        font: config.font,
        generatedDate: new Date().toISOString()
      }
    }).promise();

    return {
      url: uploadResult.Location,
      filename: filename,
      path: `logos/generated/${filename}`
    };
  } catch (error) {
    console.error('Error saving logo:', error);
    throw new Error('Failed to save logo');
  }
};

// Save uploaded logo
export const saveUploadedLogo = async (file, companyName) => {
  try {
    const filename = generateLogoFilename(companyName, 'uploaded');
    
    const uploadResult = await s3.upload({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `logos/uploaded/${filename}`,
      Body: file,
      ContentType: file.type,
      Metadata: {
        companyName: companyName,
        uploadDate: new Date().toISOString()
      }
    }).promise();

    return {
      url: uploadResult.Location,
      filename: filename,
      path: `logos/uploaded/${filename}`
    };
  } catch (error) {
    console.error('Error saving uploaded logo:', error);
    throw new Error('Failed to save uploaded logo');
  }
};