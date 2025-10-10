import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration for MongoDB Atlas Backend
// Updated for your computer's IP address

// For physical device (your phone) - use your computer's WiFi IP
const API_BASE_URL = 'http://192.168.245.160:5000/api';

// For Android emulator (if you switch to emulator later)
// const API_BASE_URL = 'http://10.0.2.2:5000/api';

// For production backend
// const API_BASE_URL = 'https://your-backend-domain.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('🔐 Token expired, clearing storage');
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
    }
    return Promise.reject(error);
  }
);

// Test backend connection
export const testConnection = async () => {
  try {
    console.log('🔍 Testing connection to:', API_BASE_URL + '/health');
    const response = await api.get('/health');
    console.log('✅ Backend connection successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    console.error('❌ Error details:', error.response?.data || error.code);
    console.error('❌ Full error:', error);
    return { success: false, error: error.message };
  }
};

export const authAPI = {
  login: async (email, password) => {
    try {
      console.log('🔐 Attempting login for:', email);
      console.log('🔍 Login URL:', API_BASE_URL + '/auth/login');
      const response = await api.post('/auth/login', { email, password });
      console.log('✅ Login successful');
      return response.data;
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      console.error('❌ Login error details:', error.response?.data || error.code);
      console.error('❌ Full login error:', error);
      throw error;
    }
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

export const locationAPI = {
  updateLocation: async (locationData) => {
    const response = await api.put('/users/location', locationData);
    return response.data;
  },
};

export const emergencyAPI = {
  addEmergencyContact: async (contactData) => {
    console.log('Adding emergency contact:', contactData);
    const response = await api.post('/users/emergency-contacts', contactData);
    console.log('Emergency contact response:', response.data);
    return response.data;
  },
  
  updateEmergencyContact: async (contactId, contactData) => {
    console.log('Updating emergency contact:', contactId, contactData);
    const response = await api.put(`/users/emergency-contacts/${contactId}`, contactData);
    console.log('Update emergency contact response:', response.data);
    return response.data;
  },
  
  deleteEmergencyContact: async (contactId) => {
    console.log('Deleting emergency contact:', contactId);
    const response = await api.delete(`/users/emergency-contacts/${contactId}`);
    console.log('Delete emergency contact response:', response.data);
    return response.data;
  },

  sendEmergencyAlert: async (locationData, message) => {
    console.log('Sending emergency alert:', locationData);
    const response = await api.post('/emergency/alert', {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      message: message
    });
    console.log('Emergency alert response:', response.data);
    return response.data;
  },

  getResponders: async () => {
    const response = await api.get('/emergency/responders');
    return response.data;
  },
};

export default api;
