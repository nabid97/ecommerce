// src/api/logoApi.ts

import axios, { AxiosResponse } from 'axios';
import { 
  LogoConfig, 
  GenerateLogoRequest, 
  GenerateLogoResponse, 
  UploadLogoRequest, 
  UploadLogoResponse, 
  GetUserLogosResponse 
} from '../types/api';

// Define the API base URL - connect directly to the backend server
const API_BASE_URL = 'http://localhost:5000/api';

export const logoApi = {
  generateLogo: async (config: LogoConfig): Promise<GenerateLogoResponse> => {
    try {
      console.log('Logo Generation Request Config:', config);

      // Construct prompt for the logo
      const prompt = 
      `- Create a professional ${config.style || 'modern'} logo design that strictly follows these specifications. The final image should ONLY contain the logo design and no additional text, labels, or annotations:
       - with text "${config.text}" in ${config.textEffect || 'Random'} font style. 
       - Main color ${config.color || 'White'}, (if it is a hex RGB code then convert it to the actual colour.)
       - Background color ${config.backgroundColor || 'Black'}. (if it is a hex RGB code then convert it to the actual colour.)
       - Dimensions: ${config.size}
       - Ensure the design is clean, minimalistic, and suitable for business use. Do not include any extraneous elements or random text.
        ${config.additionalInstructions ? `Additional details: ${config.additionalInstructions}` : ''}`;

      // Add bucket information to request
      const requestData: GenerateLogoRequest = { 
        prompt, 
        config,
        // Specify the S3 bucket to store the logo
        storage: {
          bucketName: 'ecommerce-website-generated-logo-2025',
          saveToUserProfile: true
        }
      };

      console.log('Sending logo generation request:', requestData);

      // Use axios directly with the full URL to ensure proper connection
      const response: AxiosResponse<GenerateLogoResponse> = await axios.post(
        `${API_BASE_URL}/logos/generate`, 
        requestData, 
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('Logo Generation API Response:', response.data);
      
      // Return both the imageUrl and localUrl for maximum compatibility
      return {
        imageUrl: response.data.imageUrl,
        localUrl: response.data.localUrl,
        ...response.data
      };
    } catch (error: any) {
      console.error('Logo generation API error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      throw error;
    }
  },
  
  uploadLogo: async (file: File, config: Partial<LogoConfig> = {}): Promise<UploadLogoResponse> => {
    try {
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('config', JSON.stringify(config));
      
      // Specify the S3 bucket
      formData.append('bucketName', 'ecommerce-website-generated-logo-2025');
      formData.append('saveToUserProfile', 'true');

      const response: AxiosResponse<UploadLogoResponse> = await axios.post(
        `${API_BASE_URL}/logos/upload`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Logo upload error:', error);
      throw error;
    }
  },

  // Get user's stored logos
  getUserLogos: async (): Promise<GetUserLogosResponse> => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      console.log('Token for getUserLogos:', token ? 'Present' : 'Missing');
      
      // Create headers with authorization if token exists
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Make request with the authorization headers
      const response: AxiosResponse<GetUserLogosResponse> = await axios.get(
        `${API_BASE_URL}/logos/user`, 
        { headers }
      );
      console.log('User logos response:', response.data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('Authentication required for user logos');
        return { logos: [] }; // Return empty array on auth failure
      }
      console.error('Error fetching user logos:', error);
      throw error;
    }
  },

  // Get logos (general method)
  getLogos: async (): Promise<GetUserLogosResponse> => {
    try {
      console.log('Fetching logos from API');
      const response: AxiosResponse<GetUserLogosResponse> = await axios.get(`${API_BASE_URL}/logos`);
      console.log('Logo API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getLogos:', error);
      throw error;
    }
  },

  // Delete a logo
  deleteLogo: async (logoId: string): Promise<{ message: string }> => {
    try {
      const response: AxiosResponse<{ message: string }> = await axios.delete(`${API_BASE_URL}/logos/${logoId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting logo:', error);
      throw error;
    }
  },
};

export default logoApi;