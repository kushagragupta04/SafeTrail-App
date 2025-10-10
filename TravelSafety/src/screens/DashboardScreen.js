import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentLocation, getQuickLocation, watchLocation, clearLocationWatch, requestLocationPermission, checkLocationPermission } from '../services/locationService';
import { locationAPI, emergencyAPI } from '../services/api';
import mlService from '../services/mlService';

const DashboardScreen = ({ onNavigateToEmergencyContacts, onNavigateToLocationSharing, onNavigateToSafetySettings }) => {
  const { user, logout } = useAuth();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [locationWatchId, setLocationWatchId] = useState(null);
  const [mlPrediction, setMlPrediction] = useState(null);
  const [mlInsights, setMlInsights] = useState([]);
  const [isEnablingLocation, setIsEnablingLocation] = useState(false);

  useEffect(() => {
    initializeApp();
    
    return () => {
      if (locationWatchId) {
        clearLocationWatch(locationWatchId);
      }
      mlService.stopTracking();
    };
  }, []);

  // Refresh location when component becomes focused (e.g., returning from settings)
  useEffect(() => {
    const refreshLocationOnFocus = () => {
      console.log('🔄 App focused - refreshing location');
      getLocation();
    };

    // Add a small delay to ensure the app is fully focused
    const timer = setTimeout(refreshLocationOnFocus, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing app...');
      
      // Initialize ML service first
      await initializeMLService();
      
      // Check if location permission is available
      const hasPermission = await checkLocationPermission();
      console.log('📍 Initial permission check:', hasPermission);
      
      if (hasPermission) {
        // Get initial location if permission is available
        await getLocation();
        // Start location tracking
        startLocationTracking();
      } else {
        console.log('📍 No location permission - will request when needed');
        // Don't show alert on startup, let user enable it in settings
      }
      
    } catch (error) {
      console.error('App initialization error:', error);
      Alert.alert('Error', 'Failed to initialize app. Please restart the app.');
    }
  };

  const initializeMLService = async () => {
    try {
      if (user?._id) {
        await mlService.initialize(user._id);
        
        // Set callback for ML updates
        mlService.setMLUpdateCallback((mlData) => {
          console.log('🤖 ML Update received in Dashboard:', mlData);
          console.log('🤖 Setting mlPrediction to:', mlData.prediction);
          console.log('🤖 Setting mlInsights to:', mlData.insights);
          setMlPrediction(mlData.prediction);
          setMlInsights(mlData.insights || []);
        });
        
        console.log('🤖 ML Service initialized for user:', user._id);
      }
    } catch (error) {
      console.error('❌ Failed to initialize ML service:', error);
    }
  };

  const getLocation = async () => {
    try {
      console.log('📍 Getting current location...');
      
      // Check if location permission is granted
      const hasPermission = await checkLocationPermission();
      if (!hasPermission) {
        console.log('❌ Location permission not granted');
        Alert.alert(
          'Location Permission Required',
          'Please enable location access in Safety Settings to get your current location.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      const location = await getCurrentLocation();
      console.log('📍 Location obtained:', location);
      setCurrentLocation(location);
      
      // Update location in database
      try {
        await locationAPI.updateLocation({
          latitude: location.latitude,
          longitude: location.longitude,
          isActive: true,
          lastUpdated: new Date().toISOString(),
        });
        console.log('✅ Location updated in database');
      } catch (dbError) {
        console.error('❌ Database update error:', dbError);
      }

      // Send initial location to ML model
      try {
        await mlService.sendLocationToML(location);
        console.log('✅ Initial location sent to ML model');
      } catch (mlError) {
        console.error('❌ ML model error:', mlError);
      }
      
    } catch (error) {
      console.error('❌ Error getting location:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      
      // Use enhanced error message if available
      const errorMessage = error.userMessage || 'Failed to get your current location. Please check your GPS settings and try again.';
      
      Alert.alert('Location Error', errorMessage);
    }
  };

  const startLocationTracking = () => {
    console.log('📍 Starting location tracking...');
    
    const watchId = watchLocation(async (location) => {
      console.log('📍 Location update received:', {
        lat: location.latitude,
        lng: location.longitude,
        accuracy: location.accuracy
      });
      
      setCurrentLocation(location);
      
      // Update location in database
      try {
        await locationAPI.updateLocation({
          latitude: location.latitude,
          longitude: location.longitude,
          isActive: true,
          lastUpdated: new Date().toISOString(),
        });
        console.log('✅ Location updated in database');
      } catch (error) {
        console.error('❌ Database update error:', error);
      }

      // Send location to ML model for real-time analysis
      try {
        console.log('🤖 Sending location to ML model...');
        const mlResult = await mlService.sendLocationToML(location);
        console.log('🤖 ML analysis result:', mlResult);
        
        setLastMLUpdate(new Date().toISOString());
        
        // Update ML analysis results
        const currentRisk = await mlService.getCurrentRiskLevel();
        const lastAnalysis = await mlService.getLastMLAnalysis();
        
        console.log('🤖 Current risk level:', currentRisk);
        console.log('🤖 Last analysis:', lastAnalysis);
        
        if (currentRisk) {
          setRiskLevel(currentRisk);
        }
        
        if (lastAnalysis) {
          setMlPrediction(lastAnalysis.prediction);
          setMlInsights(lastAnalysis.insights || []);
          setMlConfidence(lastAnalysis.confidence || 0);
          console.log('🤖 Updated ML display data');
        }
      } catch (error) {
        console.error('❌ ML model error:', error);
      }
    });
    
    setLocationWatchId(watchId);
    console.log('📍 Location tracking started with ID:', watchId);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await getLocation();
    setIsRefreshing(false);
  };

  const handleLocationRefresh = async () => {
    try {
      console.log('🔄 Manual location refresh requested');
      await getLocation();
      Alert.alert('Location Updated', 'Your location has been refreshed successfully.');
    } catch (error) {
      console.error('❌ Manual location refresh failed:', error);
      Alert.alert('Location Error', 'Failed to refresh location. Please check your GPS settings.');
    }
  };

  const handleEnableLocation = async () => {
    try {
      setIsEnablingLocation(true);
      console.log('📍 User requested to enable location');
      
      // Request location permission
      const hasPermission = await requestLocationPermission();
      
      if (hasPermission) {
        console.log('✅ Permission granted, getting location quickly...');
        
        // Try to get location quickly first
        try {
          const quickLocation = await getQuickLocation();
          console.log('⚡ Quick location obtained:', quickLocation);
          setCurrentLocation(quickLocation);
          
          // Update location in database
          try {
            await locationAPI.updateLocation({
              latitude: quickLocation.latitude,
              longitude: quickLocation.longitude,
              isActive: true,
              lastUpdated: new Date().toISOString(),
            });
            console.log('✅ Quick location updated in database');
          } catch (dbError) {
            console.error('❌ Database update error:', dbError);
          }

          // Send location to ML model
          try {
            await mlService.sendLocationToML(quickLocation);
            console.log('✅ Quick location sent to ML model');
          } catch (mlError) {
            console.error('❌ ML model error:', mlError);
          }
          
          // Start location tracking for more accurate updates
          startLocationTracking();
          
          Alert.alert(
            'Location Enabled',
            'Location access has been granted. Your current position is now displayed.',
            [{ text: 'OK' }]
          );
          
        } catch (quickError) {
          console.log('⚡ Quick location failed, trying regular location...');
          // If quick location fails, try regular location
          await getLocation();
          startLocationTracking();
          
          Alert.alert(
            'Location Enabled',
            'Location access has been granted. Your current position will be displayed.',
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert(
          'Location Permission Denied',
          'Location access is required for safety features. You can enable it later in Safety Settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error enabling location:', error);
      Alert.alert('Error', 'Failed to enable location. Please try again.');
    } finally {
      setIsEnablingLocation(false);
    }
  };



  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const handleEmergency = () => {
    Alert.alert(
      '🚨 Emergency Alert',
      'This will send your current location to all emergency contacts and responders. This is a real emergency alert. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Emergency Alert',
          style: 'destructive',
          onPress: sendEmergencyAlert,
        },
      ]
    );
  };

  const sendEmergencyAlert = async () => {
    try {
      if (!currentLocation) {
        Alert.alert('Error', 'Location not available. Please wait for location to load.');
        return;
      }

      // Show loading alert
      Alert.alert('Sending Emergency Alert', 'Please wait...');

      const response = await emergencyAPI.sendEmergencyAlert(currentLocation, 'Emergency alert from TravelSafety app');

      if (response.success) {
        const { recipients } = response.data;
        Alert.alert(
          '✅ Emergency Alert Sent!',
          `Your location has been shared with:\n\n• ${recipients.emergencyContacts} emergency contacts\n• ${recipients.responders} responders\n\nTotal: ${recipients.total} recipients notified`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to send emergency alert');
      }
    } catch (error) {
      console.error('Emergency alert error:', error);
      Alert.alert('Error', 'Failed to send emergency alert. Please try again.');
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.locationCard}>
        <View style={styles.locationHeader}>
          <Text style={styles.cardTitle}>Current Location</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleLocationRefresh}
          >
            <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
          </TouchableOpacity>
        </View>
        {currentLocation ? (
          <View>
            <Text style={styles.locationText}>
              Latitude: {currentLocation.latitude.toFixed(6)}
            </Text>
            <Text style={styles.locationText}>
              Longitude: {currentLocation.longitude.toFixed(6)}
            </Text>
            <Text style={styles.accuracyText}>
              Accuracy: {currentLocation.accuracy.toFixed(0)}m
            </Text>
            {currentLocation.speed && (
              <Text style={styles.accuracyText}>
                Speed: {currentLocation.speed.toFixed(1)} m/s
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.noLocationContainer}>
            <Text style={styles.noLocationText}>Location not available</Text>
            <Text style={styles.noLocationSubtext}>
              Enable location access to get your current position and use safety features.
            </Text>
            <TouchableOpacity 
              style={[styles.enableLocationButton, isEnablingLocation && styles.enableLocationButtonDisabled]}
              onPress={handleEnableLocation}
              disabled={isEnablingLocation}
            >
              <Text style={styles.enableLocationButtonText}>
                {isEnablingLocation ? '⏳ Enabling...' : '📍 Enable Location'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.mlCard}>
        <Text style={styles.cardTitle}>🤖 ML Model Output</Text>
        {console.log('🤖 Dashboard render - mlPrediction:', mlPrediction)}
        {mlPrediction ? (
          <View style={styles.predictionSection}>
            <Text style={styles.predictionLabel}>Prediction:</Text>
            <Text style={styles.predictionText}>{mlPrediction}</Text>
            {mlInsights && (
              <>
                <Text style={styles.predictionLabel}>Insights:</Text>
                <Text style={styles.predictionText}>{mlInsights}</Text>
              </>
            )}
          </View>
        ) : (
          <View style={styles.placeholderSection}>
            <Text style={styles.placeholderText}>
              🟢 You are in a safe zone
            </Text>
          </View>
        )}
      </View>


      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergency}>
          <Text style={styles.emergencyButtonText}>🚨 Emergency Alert</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onNavigateToLocationSharing}
        >
          <Text style={styles.actionButtonText}>📍 Share Location</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onNavigateToEmergencyContacts}
        >
          <Text style={styles.actionButtonText}>👥 Emergency Contacts</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onNavigateToSafetySettings}
        >
          <Text style={styles.actionButtonText}>⚙️ Safety Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone:</Text>
          <Text style={styles.infoValue}>{user?.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nationality:</Text>
          <Text style={styles.infoValue}>{user?.nationality}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Digital ID:</Text>
          <Text style={styles.infoValue}>{user?.digitalId}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  welcomeText: {
    fontSize: 16,
    color: '#6c757d',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  locationCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007bff',
    borderRadius: 6,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  noLocationContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noLocationSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  enableLocationButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  enableLocationButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  enableLocationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  mlCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mlStatus: {
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  mlButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  mlButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderSection: {
    padding: 16,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  mlOutputCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  predictionSection: {
    marginBottom: 16,
  },
  predictionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  predictionText: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  insightsSection: {
    marginTop: 8,
  },
  insightsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
    lineHeight: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  accuracyText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  noLocationText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  quickActions: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  emergencyButton: {
    backgroundColor: '#dc3545',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  actionButtonText: {
    color: '#495057',
    fontSize: 16,
    fontWeight: '500',
  },
  userInfo: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#495057',
    flex: 1,
    textAlign: 'right',
  },
});

export default DashboardScreen;
