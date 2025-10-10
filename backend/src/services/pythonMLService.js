const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class PythonMLService {
  constructor() {
    // Python ML model configuration
    this.pythonServiceUrl = process.env.PYTHON_ML_URL || 'http://localhost:8000';
    this.pythonScriptPath = process.env.PYTHON_SCRIPT_PATH || path.resolve(__dirname, '../../ml_model/predict.py');
    this.csvDataPath = process.env.CSV_DATA_PATH || path.resolve(__dirname, '../../ml_model/district_threat_profiles.csv');
    this.timeout = 10000; // 10 seconds timeout
  }

  /**
   * Send coordinates to Python ML model for analysis
   * @param {Object} coordinates - Location coordinates
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - ML model analysis result
   */
  async analyzeLocation(coordinates, userId) {
    try {
      console.log('🐍 Sending coordinates to Python ML model:', {
        lat: coordinates.latitude,
        lng: coordinates.longitude,
        userId
      });

      // Method 1: HTTP API call to Python service (Recommended)
      if (await this.isPythonServiceRunning()) {
        return await this.analyzeViaHTTP(coordinates, userId);
      }

      // Method 2: Direct Python script execution (Fallback)
      return await this.analyzeViaScript(coordinates, userId);

    } catch (error) {
      console.error('❌ Python ML analysis error:', error);
      
      // Return fallback analysis if Python model fails
      return this.getFallbackAnalysis(coordinates);
    }
  }

  /**
   * Method 1: HTTP API call to Python ML service
   */
  async analyzeViaHTTP(coordinates, userId) {
    const payload = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      accuracy: coordinates.accuracy,
      altitude: coordinates.altitude || 0,
      speed: coordinates.speed || 0,
      heading: coordinates.heading || 0,
      timestamp: new Date().toISOString(),
      userId: userId
    };

    const response = await axios.post(`${this.pythonServiceUrl}/analyze`, payload, {
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Python ML HTTP response:', response.data);
    return this.formatMLResponse(response.data);
  }

  /**
   * Method 2: Direct Python script execution
   */
  async analyzeViaScript(coordinates, userId) {
    const { spawn } = require('child_process');
    
    console.log('🐍 Executing Python script:', this.pythonScriptPath);
    console.log('🐍 Script arguments:', [
      coordinates.latitude.toString(),
      coordinates.longitude.toString(),
      coordinates.accuracy.toString(),
      userId
    ]);
    
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [
        this.pythonScriptPath,
        coordinates.latitude.toString(),
        coordinates.longitude.toString(),
        coordinates.accuracy.toString(),
        userId
      ], {
        cwd: path.dirname(this.pythonScriptPath) // Set working directory to script location
      });

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
            // Extract JSON from output (Python script may output other text)
            const jsonMatch = output.match(/\{.*\}/s);
            if (!jsonMatch) {
              throw new Error('No JSON found in Python output');
            }
            
            const result = JSON.parse(jsonMatch[0]);
            console.log('✅ Python script result:', result);
            resolve(this.formatMLResponse(result));
          } catch (parseError) {
            console.error('❌ Failed to parse Python output:', parseError);
            console.error('❌ Raw output:', output);
            reject(new Error('Invalid Python script output'));
          }
        } else {
          console.error('❌ Python script error:', errorOutput);
          console.error('❌ Raw output:', output);
          reject(new Error(`Python script failed with code ${code}`));
        }
      });

      // Timeout handling
      setTimeout(() => {
        pythonProcess.kill();
        reject(new Error('Python script timeout'));
      }, this.timeout);
    });
  }

  /**
   * Check if Python ML service is running
   */
  async isPythonServiceRunning() {
    try {
      await axios.get(`${this.pythonServiceUrl}/health`, { timeout: 2000 });
      return true;
    } catch (error) {
      console.log('🐍 Python service not running, will use script execution');
      return false;
    }
  }

  /**
   * Format ML model response to standard format
   */
  formatMLResponse(pythonResult) {
    return {
      riskLevel: pythonResult.risk_level || pythonResult.riskLevel || 'low',
      confidence: pythonResult.confidence || 0.85,
      prediction: pythonResult.prediction || pythonResult.result,
      insights: pythonResult.insights || [],
      recommendations: pythonResult.recommendations || [],
      safetyAlert: pythonResult.safety_alert || pythonResult.safetyAlert,
      modelVersion: pythonResult.model_version || pythonResult.modelVersion || '1.0',
      processingTime: pythonResult.processing_time || pythonResult.processingTime,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Fallback analysis when Python model is unavailable
   */
  getFallbackAnalysis(coordinates) {
    console.log('⚠️ Using fallback analysis - Python model unavailable');
    
    return {
      riskLevel: 'unknown',
      confidence: 0.0,
      prediction: 'Model unavailable',
      insights: ['ML model is currently unavailable'],
      recommendations: ['Please check ML model service'],
      safetyAlert: null,
      modelVersion: 'fallback',
      processingTime: 0,
      timestamp: new Date().toISOString(),
      isFallback: true
    };
  }

  /**
   * Get ML model status and health
   */
  async getModelStatus() {
    try {
      if (await this.isPythonServiceRunning()) {
        const response = await axios.get(`${this.pythonServiceUrl}/status`, { timeout: 5000 });
        return {
          status: 'running',
          method: 'http',
          details: response.data
        };
      } else {
        // Check if Python script exists
        try {
          await fs.access(this.pythonScriptPath);
          return {
            status: 'available',
            method: 'script',
            scriptPath: this.pythonScriptPath
          };
        } catch (error) {
          return {
            status: 'unavailable',
            method: 'none',
            error: 'Python script not found'
          };
        }
      }
    } catch (error) {
      return {
        status: 'error',
        method: 'none',
        error: error.message
      };
    }
  }

  /**
   * Update ML model with new training data
   */
  async updateModel(newData) {
    try {
      if (await this.isPythonServiceRunning()) {
        const response = await axios.post(`${this.pythonServiceUrl}/update-model`, newData, {
          timeout: 30000 // 30 seconds for model update
        });
        return response.data;
      } else {
        throw new Error('Python service not available for model update');
      }
    } catch (error) {
      console.error('❌ Model update error:', error);
      throw error;
    }
  }

  /**
   * Get model performance metrics
   */
  async getModelMetrics() {
    try {
      if (await this.isPythonServiceRunning()) {
        const response = await axios.get(`${this.pythonServiceUrl}/metrics`, { timeout: 5000 });
        return response.data;
      } else {
        return {
          status: 'unavailable',
          message: 'Python service not running'
        };
      }
    } catch (error) {
      console.error('❌ Get metrics error:', error);
      return {
        status: 'error',
        message: error.message
      };
    }
  }
}

// Create singleton instance
const pythonMLService = new PythonMLService();

module.exports = pythonMLService;
