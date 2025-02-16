// src/services/fabricService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const fabricService = {
  // Fetch available fabric types
  getFabricTypes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/fabrics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching fabric types:', error);
      throw error;
    }
  },

  // Get fabric availability
  checkAvailability: async (fabricId, color, length) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/fabrics/${fabricId}/availability`, {
        params: { color, length }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking fabric availability:', error);
      throw error;
    }
  },

  // Place fabric order
  placeOrder: async (orderDetails) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/orders/fabric`, orderDetails);
      return response.data;
    } catch (error) {
      console.error('Error placing fabric order:', error);
      throw error;
    }
  },

  // Upload fabric image
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(`${API_BASE_URL}/api/fabrics/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading fabric image:', error);
      throw error;
    }
  },

  // Get fabric pricing
  getPricing: async (fabricId, length, quantity) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/fabrics/${fabricId}/pricing`, {
        params: { length, quantity }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting fabric pricing:', error);
      throw error;
    }
  }
};

