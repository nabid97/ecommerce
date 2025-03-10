// src/server/services/s3Service.ts
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

// Define interfaces for the response objects
interface UploadURLResponse {
  uploadURL: string;
  fileName: string;
}

interface UploadFileResponse {
  url: string;
  key: string;
}

interface S3File {
  buffer: Buffer;
  originalname?: string;
  mimetype?: string;
  [key: string]: any;
}

// Update S3 configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Log AWS configuration status for debugging
console.log('\n===== AWS S3 CONFIGURATION =====');
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✓ Set' : '✗ Not set');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✓ Set' : '✗ Not set');
console.log('AWS_REGION:', process.env.AWS_REGION || 'us-east-1 (default)');
console.log('AWS_S3_BUCKET:', process.env.AWS_S3_BUCKET || 'ecommerce-website-generated-logo-2025 (default)');
console.log('=================================\n');

// Use the specified bucket name
const S3_BUCKET = process.env.AWS_S3_BUCKET || 'ecommerce-website-generated-logo-2025';

const s3Service = {
  generateUploadURL: async (folder: string = 'general'): Promise<UploadURLResponse> => {
    const fileName = `${folder}/${uuidv4()}`;

    const params: AWS.S3.PresignedPost.Params = {
      Bucket: S3_BUCKET,
      Key: fileName,
      Expires: 60, // URL expires in 60 seconds
    };

    try {
      console.log(`Generating upload URL for bucket: ${S3_BUCKET}, key: ${fileName}`);
      const uploadURL = await s3.getSignedUrlPromise('putObject', params);
      return {
        uploadURL,
        fileName
      };
    } catch (error) {
      console.error('Failed to generate S3 upload URL:', error);
      throw new Error('Failed to generate upload URL');
    }
  },

  uploadFile: async (file: S3File, folder: string = 'general'): Promise<UploadFileResponse> => {
    const fileName = `${folder}/${uuidv4()}-${file.originalname || 'file'}`;

    // Base params without ACL (removed ACL: 'public-read')
    const params: AWS.S3.PutObjectRequest = {
      Bucket: S3_BUCKET,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype || 'application/octet-stream'
      // ACL parameter removed since the bucket doesn't support ACLs
    };

    try {
      console.log(`Uploading to S3 bucket: ${S3_BUCKET}, key: ${fileName}`);
      const result = await s3.upload(params).promise();
      console.log('S3 upload successful:', result.Location);
      
      // Generate a publicly accessible URL based on the bucket and key
      // since we can't use ACLs for public access
      const publicUrl = `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`;
      
      return {
        url: publicUrl, // Use constructed URL instead of result.Location
        key: result.Key
      };
    } catch (error) {
      console.error('Failed to upload file to S3:', error);
      throw new Error('Failed to upload file');
    }
  },

  deleteFile: async (key: string): Promise<boolean> => {
    if (!key) {
      console.warn('No key provided for S3 deletion');
      return false;
    }

    const params: AWS.S3.DeleteObjectRequest = {
      Bucket: S3_BUCKET,
      Key: key
    };

    try {
      console.log(`Deleting from S3 bucket: ${S3_BUCKET}, key: ${key}`);
      await s3.deleteObject(params).promise();
      console.log('S3 delete successful');
      return true;
    } catch (error) {
      console.error('Failed to delete file from S3:', error);
      throw new Error('Failed to delete file');
    }
  },

  getFile: async (key: string): Promise<AWS.S3.GetObjectOutput> => {
    if (!key) {
      throw new Error('No key provided for S3 retrieval');
    }
    
    const params: AWS.S3.GetObjectRequest = {
      Bucket: S3_BUCKET,
      Key: key
    };

    try {
      console.log(`Getting file from S3 bucket: ${S3_BUCKET}, key: ${key}`);
      const data = await s3.getObject(params).promise();
      return data;
    } catch (error) {
      console.error('Failed to get file from S3:', error);
      throw new Error('Failed to get file');
    }
  },

  listFiles: async (prefix: string = ''): Promise<AWS.S3.Object[]> => {
    const params: AWS.S3.ListObjectsV2Request = {
      Bucket: S3_BUCKET,
      Prefix: prefix
    };

    try {
      console.log(`Listing files in S3 bucket: ${S3_BUCKET}, prefix: ${prefix}`);
      const data = await s3.listObjectsV2(params).promise();
      return data.Contents || [];
    } catch (error) {
      console.error('Failed to list files from S3:', error);
      throw new Error('Failed to list files');
    }
  },

  // Get a signed URL for an existing object
  getSignedUrl: async (key: string, expires: number = 3600): Promise<string> => {
    if (!key) {
      throw new Error('No key provided for signed URL');
    }
    
    const params: AWS.S3.GetObjectRequest = {
      Bucket: S3_BUCKET,
      Key: key,
      Expires: expires // URL expiration time in seconds
    };

    try {
      console.log(`Generating signed URL for S3 bucket: ${S3_BUCKET}, key: ${key}`);
      const url = await s3.getSignedUrlPromise('getObject', params);
      return url;
    } catch (error) {
      console.error('Failed to generate signed URL:', error);
      throw new Error('Failed to generate signed URL');
    }
  }
};

export default s3Service;