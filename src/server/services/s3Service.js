const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3Service = {
  generateUploadURL: async (folder = 'general') => {
    const fileName = `${folder}/${uuidv4()}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      Expires: 60, // URL expires in 60 seconds
    };

    try {
      const uploadURL = await s3.getSignedUrlPromise('putObject', params);
      return {
        uploadURL,
        fileName
      };
    } catch (error) {
      throw new Error('Failed to generate upload URL');
    }
  },

  uploadFile: async (file, folder = 'general') => {
    const fileName = `${folder}/${uuidv4()}-${file.originalname}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    try {
      const result = await s3.upload(params).promise();
      return {
        url: result.Location,
        key: result.Key
      };
    } catch (error) {
      throw new Error('Failed to upload file');
    }
  },

  deleteFile: async (key) => {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    };

    try {
      await s3.deleteObject(params).promise();
      return true;
    } catch (error) {
      throw new Error('Failed to delete file');
    }
  },

  getFile: async (key) => {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    };

    try {
      const data = await s3.getObject(params).promise();
      return data;
    } catch (error) {
      throw new Error('Failed to get file');
    }
  },

  listFiles: async (prefix = '') => {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix: prefix
    };

    try {
      const data = await s3.listObjectsV2(params).promise();
      return data.Contents;
    } catch (error) {
      throw new Error('Failed to list files');
    }
  }
};

module.exports = s3Service;