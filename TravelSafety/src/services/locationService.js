import { PermissionsAndroid, Platform, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      console.log('🔐 Requesting Android location permissions...');
      
      // Request fine location permission first
      const fineLocationGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'TravelSafety needs access to your location to provide safety features and emergency services.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      
      console.log('📍 Fine location permission result:', fineLocationGranted);
      
      // If fine location is denied, try coarse location
      if (fineLocationGranted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('📍 Fine location denied, trying coarse location...');
        const coarseLocationGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          {
            title: 'Location Permission',
            message: 'TravelSafety needs basic location access for safety features.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        console.log('📍 Coarse location permission result:', coarseLocationGranted);
        
        if (coarseLocationGranted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        }
      } else {
        return true;
      }
      
      // If both are denied
      Alert.alert(
        'Permission Denied',
        'Location permission is required for safety features. Please enable it in settings.',
        [{ text: 'OK' }]
      );
      return false;
      
    } catch (err) {
      console.warn('❌ Error requesting location permission:', err);
      return false;
    }
  } else {
    // iOS permissions are handled automatically
    console.log('🍎 iOS - location permission handled automatically');
    return true;
  }
};

// Check if location permission is already granted
export const checkLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      console.log('🔍 Checking Android location permissions...');
      
      // Check both fine and coarse location permissions
      const fineLocation = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      const coarseLocation = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
      );
      
      console.log('📍 Fine location permission:', fineLocation);
      console.log('📍 Coarse location permission:', coarseLocation);
      
      // Return true if either permission is granted
      const hasPermission = fineLocation || coarseLocation;
      console.log('📍 Final permission status:', hasPermission);
      
      return hasPermission;
    } catch (err) {
      console.warn('❌ Error checking location permission:', err);
      return false;
    }
  } else {
    // iOS permissions are handled automatically
    console.log('🍎 iOS - assuming location permission is available');
    return true;
  }
};

// Get current location using real GPS - optimized for speed
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    // First try with fast, less accurate settings
    const fastOptions = {
      enableHighAccuracy: false, // Use network/cell towers for speed
      timeout: 10000, // 10 second timeout
      maximumAge: 300000, // Accept location up to 5 minutes old
    };

    console.log('📍 Requesting current location (fast mode):', fastOptions);

    Geolocation.getCurrentPosition(
      (position) => {
        console.log('📍 Current location obtained (fast):', position.coords);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          speed: position.coords.speed,
          heading: position.coords.heading,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        console.log('📍 Fast location failed, trying high accuracy...');
        
        // If fast mode fails, try high accuracy mode
        const accurateOptions = {
          enableHighAccuracy: true, // Use GPS for accuracy
          timeout: 15000, // 15 second timeout
          maximumAge: 60000, // Accept location up to 1 minute old
        };

        Geolocation.getCurrentPosition(
          (position) => {
            console.log('📍 Current location obtained (accurate):', position.coords);
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude,
              speed: position.coords.speed,
              heading: position.coords.heading,
              timestamp: position.timestamp,
            });
          },
          (finalError) => {
            console.error('❌ Both location attempts failed:', finalError);
            console.error('❌ Error code:', finalError.code);
            console.error('❌ Error message:', finalError.message);
            
            // Provide more user-friendly error messages
            let userMessage = 'Failed to get location';
            if (finalError.code === 1) {
              userMessage = 'Location permission denied';
            } else if (finalError.code === 2) {
              userMessage = 'Location unavailable - please check GPS settings';
            } else if (finalError.code === 3) {
              userMessage = 'Location request timed out - please try again';
            }
            
            const enhancedError = {
              ...finalError,
              userMessage: userMessage
            };
            
            reject(enhancedError);
          },
          accurateOptions
        );
      },
      fastOptions
    );
  });
};

// Watch location changes in real-time
export const watchLocation = (callback) => {
  const options = {
    enableHighAccuracy: true,
    distanceFilter: 10, // Update every 10 meters
    interval: 5000, // Update every 5 seconds
    fastestInterval: 2000, // Fastest update every 2 seconds
  };

  const watchId = Geolocation.watchPosition(
    (position) => {
      console.log('📍 Location update:', position.coords);
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        speed: position.coords.speed,
        heading: position.coords.heading,
        timestamp: position.timestamp,
      });
    },
    (error) => {
      console.error('❌ Location watch error:', error);
    },
    options
  );

  return watchId; // Return watch ID for clearing
};

// Clear location watch
export const clearLocationWatch = (watchId) => {
  if (watchId) {
    Geolocation.clearWatch(watchId);
    console.log('📍 Location watch cleared');
  }
};

// Get location quickly using cached data if available
export const getQuickLocation = () => {
  return new Promise((resolve, reject) => {
    const quickOptions = {
      enableHighAccuracy: false, // Use network for speed
      timeout: 5000, // Very short timeout
      maximumAge: 600000, // Accept location up to 10 minutes old
    };

    console.log('⚡ Getting quick location:', quickOptions);

    Geolocation.getCurrentPosition(
      (position) => {
        console.log('⚡ Quick location obtained:', position.coords);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          speed: position.coords.speed,
          heading: position.coords.heading,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        console.log('⚡ Quick location failed:', error.message);
        reject(error);
      },
      quickOptions
    );
  });
};

// Test if location permission is actually working
export const testLocationPermission = async () => {
  try {
    console.log('🧪 Testing location permission...');
    
    // First check permission status
    const hasPermission = await checkLocationPermission();
    console.log('🧪 Permission check result:', hasPermission);
    
    if (!hasPermission) {
      console.log('🧪 No permission - cannot test location');
      return { hasPermission: false, canGetLocation: false, error: 'No permission' };
    }
    
    // Try to get location with a short timeout
    const location = await new Promise((resolve, reject) => {
      const options = {
        enableHighAccuracy: true,
        timeout: 5000, // 5 second timeout for testing
        maximumAge: 0, // Don't use cached location
      };

      Geolocation.getCurrentPosition(
        (position) => {
          console.log('🧪 Test location obtained:', position.coords);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          console.log('🧪 Test location error:', error);
          reject(error);
        },
        options
      );
    });
    
    console.log('🧪 Location test successful:', location);
    return { hasPermission: true, canGetLocation: true, location };
    
  } catch (error) {
    console.log('🧪 Location test failed:', error);
    return { hasPermission: true, canGetLocation: false, error: error.message };
  }
};
