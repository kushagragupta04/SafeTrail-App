import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  ScrollView,
} from 'react-native';
import { requestLocationPermission, checkLocationPermission, testLocationPermission } from '../services/locationService';
import { useAuth } from '../contexts/AuthContext';

const SafetySettingsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [locationPermission, setLocationPermission] = useState(false);
  const [locationTracking, setLocationTracking] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [familyNotifications, setFamilyNotifications] = useState(true);

  useEffect(() => {
    // Initialize settings from user data
    if (user?.safetySettings) {
      setLocationTracking(user.safetySettings.locationTracking);
      setEmergencyAlerts(user.safetySettings.emergencyAlerts);
      setFamilyNotifications(user.safetySettings.familyNotifications);
    }
    
    // Check current location permission status
    checkCurrentPermissionStatus();
  }, [user]);

  const checkCurrentPermissionStatus = async () => {
    try {
      console.log('🔍 Checking current permission status...');
      const testResult = await testLocationPermission();
      console.log('🧪 Test result:', testResult);
      
      // Set permission based on actual test result
      setLocationPermission(testResult.hasPermission && testResult.canGetLocation);
      
      if (testResult.hasPermission && testResult.canGetLocation) {
        console.log('✅ Location permission is working correctly');
      } else if (testResult.hasPermission && !testResult.canGetLocation) {
        console.log('⚠️ Permission granted but location access failed:', testResult.error);
      } else {
        console.log('❌ No location permission');
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      setLocationPermission(false);
    }
  };

  const handleLocationPermission = async () => {
    try {
      console.log('🔐 Requesting location permission...');
      const granted = await requestLocationPermission();
      
      // Test the permission after requesting it
      console.log('🧪 Testing permission after request...');
      const testResult = await testLocationPermission();
      console.log('🧪 Post-request test result:', testResult);
      
      // Set permission based on actual test result
      const actuallyWorking = testResult.hasPermission && testResult.canGetLocation;
      setLocationPermission(actuallyWorking);
      
      if (actuallyWorking) {
        console.log('✅ Location permission granted and working');
        Alert.alert(
          'Location Permission Granted',
          'Location access has been enabled and is working correctly. The app can now track your location for safety features.',
          [{ text: 'OK' }]
        );
      } else if (testResult.hasPermission && !testResult.canGetLocation) {
        console.log('⚠️ Permission granted but location access failed');
        Alert.alert(
          'Permission Issue',
          `Location permission was granted but location access failed: ${testResult.error}. Please check your GPS settings.`,
          [{ text: 'OK' }]
        );
      } else {
        console.log('❌ Location permission denied');
        Alert.alert(
          'Location Permission Denied',
          'Location access is required for safety features. You can enable it later in your device settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert('Error', 'Failed to request location permission. Please try again.');
    }
  };

  const handleLocationTrackingToggle = (value) => {
    setLocationTracking(value);
    // Here you would typically save this to the backend
    console.log('Location tracking toggled:', value);
  };

  const handleEmergencyAlertsToggle = (value) => {
    setEmergencyAlerts(value);
    // Here you would typically save this to the backend
    console.log('Emergency alerts toggled:', value);
  };

  const handleFamilyNotificationsToggle = (value) => {
    setFamilyNotifications(value);
    // Here you would typically save this to the backend
    console.log('Family notifications toggled:', value);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Safety Settings</Text>
        <Text style={styles.subtitle}>Configure your safety preferences</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location Services</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Location Permission</Text>
            <Text style={styles.settingDescription}>
              Allow the app to access your location for safety features
            </Text>
          </View>
          <View style={styles.permissionButtonContainer}>
            <TouchableOpacity
              style={[styles.permissionButton, { backgroundColor: locationPermission ? '#28a745' : '#dc3545' }]}
              onPress={handleLocationPermission}
            >
              <Text style={styles.permissionButtonText}>
                {locationPermission ? 'Granted' : 'Grant Access'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.refreshPermissionButton}
              onPress={checkCurrentPermissionStatus}
            >
              <Text style={styles.refreshPermissionButtonText}>🔄</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Location Tracking</Text>
            <Text style={styles.settingDescription}>
              Continuously track your location for safety monitoring
            </Text>
          </View>
          <Switch
            value={locationTracking}
            onValueChange={handleLocationTrackingToggle}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={locationTracking ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Emergency Alerts</Text>
            <Text style={styles.settingDescription}>
              Receive alerts about potential safety risks in your area
            </Text>
          </View>
          <Switch
            value={emergencyAlerts}
            onValueChange={handleEmergencyAlertsToggle}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={emergencyAlerts ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Family Notifications</Text>
            <Text style={styles.settingDescription}>
              Send location updates to your emergency contacts
            </Text>
          </View>
          <Switch
            value={familyNotifications}
            onValueChange={handleFamilyNotificationsToggle}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={familyNotifications ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ML Model</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>AI Safety Analysis</Text>
            <Text style={styles.settingDescription}>
              Enable AI-powered safety analysis of your location data
            </Text>
          </View>
          <Switch
            value={true}
            onValueChange={() => {}}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={'#f5dd4b'}
            disabled={true}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          These settings help keep you safe while traveling. Make sure to enable location services for the best experience.
        </Text>
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
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  permissionButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permissionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
    marginRight: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  refreshPermissionButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#6c757d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshPermissionButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  footer: {
    padding: 20,
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SafetySettingsScreen;
