import axios from 'axios';

// Test different connection URLs
export const testAllConnections = async () => {
  const urls = [
    'http://10.0.2.2:5000/api/health', // Android emulator
    'http://192.168.51.1:5000/api/health', // Your computer's WiFi IP
    'http://10.67.62.161:5000/api/health', // Your other IP
    'http://localhost:5000/api/health', // Localhost (won't work on phone)
  ];

  console.log('🔍 Testing all possible connections...');
  
  for (const url of urls) {
    try {
      console.log(`Testing: ${url}`);
      const response = await axios.get(url, { timeout: 5000 });
      console.log(`✅ SUCCESS: ${url} - ${response.data.message}`);
      return { success: true, url, data: response.data };
    } catch (error) {
      console.log(`❌ FAILED: ${url} - ${error.message}`);
    }
  }
  
  console.log('❌ All connections failed');
  return { success: false, error: 'No working connection found' };
};

// Test with your existing user credentials
export const testLoginConnection = async () => {
  const testUrls = [
    'http://10.0.2.2:5000/api',
    'http://192.168.51.1:5000/api',
    'http://10.67.62.161:5000/api',
  ];

  for (const baseUrl of testUrls) {
    try {
      console.log(`Testing login with: ${baseUrl}`);
      const response = await axios.post(`${baseUrl}/auth/login`, {
        email: 'guptarashi2201@gmail.com',
        password: 'test123' // You'll need to enter the correct password
      }, { timeout: 10000 });
      
      console.log(`✅ Login successful with: ${baseUrl}`);
      return { success: true, url: baseUrl, data: response.data };
    } catch (error) {
      console.log(`❌ Login failed with: ${baseUrl} - ${error.message}`);
      if (error.response?.status === 401) {
        console.log('🔐 Invalid credentials (this means connection is working)');
        return { success: true, url: baseUrl, error: 'Invalid credentials' };
      }
    }
  }
  
  return { success: false, error: 'No working connection found' };
};
