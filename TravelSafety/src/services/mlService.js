import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ML Model API Configuration
const ML_API_BASE_URL = 'http://192.168.245.160:5000/api/ml'; // Your ML model endpoint
const LOCATION_UPDATE_INTERVAL = 5000; // Send coordinates every 5 seconds
const MIN_DISTANCE_THRESHOLD = 10; // Minimum 10 meters movement to send update

class MLService {
  constructor() {
    this.isTracking = false;
    this.lastSentLocation = null;
    this.updateInterval = null;
    this.userId = null;
    this.onMLUpdate = null; // Callback for ML updates
  }

  // Initialize ML service with user ID
  async initialize(userId) {
    this.userId = userId;
    console.log('🤖 ML Service initialized for user:', userId);
  }

  // Set callback for ML updates
  setMLUpdateCallback(callback) {
    this.onMLUpdate = callback;
    console.log('🤖 ML update callback set');
  }

  // Start real-time location tracking and ML analysis
  async startTracking() {
    if (this.isTracking) {
      console.log('🤖 ML tracking already active');
      return;
    }

    try {
      // Get current location first
      const { getCurrentLocation } = await import('./locationService');
      const currentLocation = await getCurrentLocation();
      
      // Send initial location to ML model
      await this.sendLocationToML(currentLocation);
      
      // Start continuous tracking
      this.isTracking = true;
      this.updateInterval = setInterval(async () => {
        try {
          const location = await getCurrentLocation();
          await this.sendLocationToML(location);
        } catch (error) {
          console.error('❌ ML tracking error:', error);
        }
      }, LOCATION_UPDATE_INTERVAL);

      console.log('🤖 ML tracking started - sending coordinates every 5 seconds');
    } catch (error) {
      console.error('❌ Failed to start ML tracking:', error);
      throw error;
    }
  }

  // Stop real-time tracking
  stopTracking() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isTracking = false;
    console.log('🤖 ML tracking stopped');
  }

  // Send location data to ML model
  async sendLocationToML(locationData) {
    try {
      // Check if location has changed significantly
      if (this.shouldSendLocation(locationData)) {
        const mlPayload = {
          coordinates: {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            accuracy: locationData.accuracy,
            altitude: locationData.altitude || 0,
            speed: locationData.speed || 0,
            heading: locationData.heading || 0,
          },
          timestamp: new Date().toISOString(),
          metadata: {
            userId: this.userId,
            deviceType: 'mobile',
            appVersion: '1.0.0',
            platform: 'react-native',
          }
        };

        console.log('🤖 Sending coordinates to ML model:', {
          lat: locationData.latitude,
          lng: locationData.longitude,
          accuracy: locationData.accuracy
        });

        // Get authentication token
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.post(`${ML_API_BASE_URL}/analyze-location`, mlPayload, {
          timeout: 15000, // Increased timeout for ML processing
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data) {
          console.log('✅ ML analysis result:', response.data);
          
          // Handle ML model response
          await this.handleMLResponse(response.data);
          
          // Update last sent location
          this.lastSentLocation = {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            timestamp: Date.now()
          };
        }

        return response.data;
      } else {
        console.log('📍 Location not changed significantly, skipping ML update');
      }
    } catch (error) {
      console.error('❌ Failed to send location to ML model:', error);
      
      // Don't throw error to prevent breaking the tracking loop
      // Just log it and continue
      if (error.response) {
        console.error('ML API Error:', error.response.status, error.response.data);
        console.error('ML API Error Headers:', error.response.headers);
      } else if (error.request) {
        console.error('ML API Network Error:', error.message);
        console.error('ML API Request:', error.request);
      } else {
        console.error('ML API Setup Error:', error.message);
      }
    }
  }

  // Check if location has changed enough to warrant sending to ML model
  shouldSendLocation(newLocation) {
    if (!this.lastSentLocation) {
      return true; // First location update
    }

    // Calculate distance between last sent location and new location
    const distance = this.calculateDistance(
      this.lastSentLocation.latitude,
      this.lastSentLocation.longitude,
      newLocation.latitude,
      newLocation.longitude
    );

    // Send if moved more than threshold or if it's been more than 30 seconds
    const timeDiff = Date.now() - this.lastSentLocation.timestamp;
    return distance > MIN_DISTANCE_THRESHOLD || timeDiff > 30000;
  }

  // Calculate distance between two coordinates (in meters)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  // Handle ML model response
  async handleMLResponse(mlResponse) {
    try {
      console.log('🤖 Handling ML response:', mlResponse);
      
      // Store ML analysis result
      await AsyncStorage.setItem('lastMLAnalysis', JSON.stringify({
        ...mlResponse,
        timestamp: new Date().toISOString()
      }));

      // Call the callback to update UI
      if (this.onMLUpdate && mlResponse.data) {
        this.onMLUpdate({
          prediction: mlResponse.data.prediction,
          insights: mlResponse.data.insights,
          riskLevel: mlResponse.data.riskLevel,
          confidence: mlResponse.data.confidence,
          recommendations: mlResponse.data.recommendations
        });
      }

      // Check for safety alerts from ML model
      if (mlResponse.safetyAlert) {
        console.log('🚨 ML Safety Alert:', mlResponse.safetyAlert);
        
        // You can trigger emergency actions here
        // For example, send notifications, alert emergency contacts, etc.
        await this.handleSafetyAlert(mlResponse.safetyAlert);
      }

      // Check for risk assessment
      if (mlResponse.riskLevel) {
        console.log('⚠️ Risk Level:', mlResponse.riskLevel);
        
        // Update risk level in app state
        await AsyncStorage.setItem('currentRiskLevel', mlResponse.riskLevel);
      }

      // Check for location insights
      if (mlResponse.insights) {
        console.log('💡 Location Insights:', mlResponse.insights);
      }

    } catch (error) {
      console.error('❌ Error handling ML response:', error);
    }
  }

  // Handle safety alerts from ML model
  async handleSafetyAlert(safetyAlert) {
    try {
      // Store the alert
      await AsyncStorage.setItem('lastSafetyAlert', JSON.stringify({
        ...safetyAlert,
        timestamp: new Date().toISOString()
      }));

      // You can implement different actions based on alert type
      switch (safetyAlert.type) {
        case 'high_risk_area':
          console.log('🚨 High risk area detected');
          break;
        case 'suspicious_activity':
          console.log('🚨 Suspicious activity detected');
          break;
        case 'emergency_situation':
          console.log('🚨 Emergency situation detected');
          // Could trigger automatic emergency alert
          break;
        default:
          console.log('🚨 Unknown safety alert:', safetyAlert.type);
      }

      // You can also send push notifications or trigger other actions here
      
    } catch (error) {
      console.error('❌ Error handling safety alert:', error);
    }
  }

  // Get last ML analysis result
  async getLastMLAnalysis() {
    try {
      const analysis = await AsyncStorage.getItem('lastMLAnalysis');
      return analysis ? JSON.parse(analysis) : null;
    } catch (error) {
      console.error('❌ Error getting last ML analysis:', error);
      return null;
    }
  }

  // Get current risk level
  async getCurrentRiskLevel() {
    try {
      return await AsyncStorage.getItem('currentRiskLevel');
    } catch (error) {
      console.error('❌ Error getting risk level:', error);
      return null;
    }
  }

  // Get last safety alert
  async getLastSafetyAlert() {
    try {
      const alert = await AsyncStorage.getItem('lastSafetyAlert');
      return alert ? JSON.parse(alert) : null;
    } catch (error) {
      console.error('❌ Error getting last safety alert:', error);
      return null;
    }
  }

  // Check if tracking is active
  isTrackingActive() {
    return this.isTracking;
  }

  // Get tracking status
  getTrackingStatus() {
    return {
      isTracking: this.isTracking,
      userId: this.userId,
      lastUpdate: this.lastSentLocation?.timestamp,
      updateInterval: LOCATION_UPDATE_INTERVAL
    };
  }
}

// Create singleton instance
const mlService = new MLService();

export default mlService;
