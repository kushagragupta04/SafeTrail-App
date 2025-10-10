const axios = require('axios');

// Test ML integration
async function testMLIntegration() {
  const API_BASE_URL = 'http://localhost:5000/api';
  
  try {
    console.log('🧪 Testing ML Integration...');
    
    // Test coordinates (Delhi)
    const testCoordinates = {
      latitude: 28.7041,
      longitude: 77.1025,
      accuracy: 10.0,
      altitude: 0,
      speed: 0,
      heading: 0,
      timestamp: new Date().toISOString(),
      userId: 'test-user-123'
    };

    console.log('📍 Sending test coordinates:', testCoordinates);

    const response = await axios.post(`${API_BASE_URL}/ml/analyze-location`, testCoordinates, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // You might need a real token
      }
    });

    console.log('✅ ML Analysis Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ ML Integration Test Failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Test Python script directly
async function testPythonScript() {
  const { spawn } = require('child_process');
  const path = require('path');
  
  return new Promise((resolve, reject) => {
    console.log('🐍 Testing Python script directly...');
    
    const pythonProcess = spawn('python', [
      path.join(__dirname, 'ml_model', 'predict.py'),
      '28.7041', // latitude
      '77.1025', // longitude
      '10.0',    // accuracy
      'test-user-123' // user_id
    ]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          console.log('✅ Python Script Result:', JSON.stringify(result, null, 2));
          resolve(result);
        } catch (parseError) {
          console.error('❌ Failed to parse Python output:', parseError);
          console.log('Raw output:', output);
          reject(parseError);
        }
      } else {
        console.error('❌ Python script failed with code:', code);
        console.error('Error output:', errorOutput);
        reject(new Error(`Python script failed with code ${code}`));
      }
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      pythonProcess.kill();
      reject(new Error('Python script timeout'));
    }, 30000);
  });
}

// Run tests
async function runTests() {
  console.log('🚀 Starting ML Integration Tests...\n');
  
  // Test 1: Python script directly
  try {
    await testPythonScript();
    console.log('\n✅ Python script test passed!\n');
  } catch (error) {
    console.log('\n❌ Python script test failed!\n');
  }
  
  // Test 2: Backend ML endpoint (if server is running)
  try {
    await testMLIntegration();
    console.log('\n✅ Backend ML endpoint test passed!\n');
  } catch (error) {
    console.log('\n❌ Backend ML endpoint test failed!\n');
  }
  
  console.log('🏁 Tests completed!');
}

runTests();
