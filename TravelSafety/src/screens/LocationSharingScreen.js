import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Linking,
  Clipboard,
} from 'react-native';
import { getCurrentLocation } from '../services/locationService';

const LocationSharingScreen = ({ onBack }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locationUrl, setLocationUrl] = useState('');

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    setIsLoading(true);
    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      
      // Create Google Maps URL
      const mapsUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
      setLocationUrl(mapsUrl);
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setIsLoading(false);
    }
  };

  const shareLocation = async () => {
    if (!currentLocation) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    try {
      const message = `📍 My current location:\n\nLatitude: ${currentLocation.latitude.toFixed(6)}\nLongitude: ${currentLocation.longitude.toFixed(6)}\n\nView on map: ${locationUrl}`;
      
      await Share.share({
        message: message,
        url: locationUrl,
        title: 'My Location',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share location');
    }
  };


  const copyLocation = async () => {
    if (!currentLocation) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    try {
      const locationText = `Latitude: ${currentLocation.latitude.toFixed(6)}\nLongitude: ${currentLocation.longitude.toFixed(6)}\n\nGoogle Maps: ${locationUrl}`;
      await Clipboard.setString(locationText);
      Alert.alert('Copied', 'Location details copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy location');
    }
  };

  const openInMaps = async () => {
    if (!locationUrl) {
      Alert.alert('Error', 'Location URL not available');
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(locationUrl);
      if (canOpen) {
        await Linking.openURL(locationUrl);
      } else {
        Alert.alert('Error', 'Cannot open maps application');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open maps');
    }
  };

  const shareViaEmail = async () => {
    if (!currentLocation) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    try {
      const subject = 'My Current Location';
      const body = `Hi,\n\nHere is my current location:\n\nLatitude: ${currentLocation.latitude.toFixed(6)}\nLongitude: ${currentLocation.longitude.toFixed(6)}\n\nView on Google Maps: ${locationUrl}\n\nSent from TravelSafety App`;
      
      const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      await Linking.openURL(emailUrl);
    } catch (error) {
      Alert.alert('Error', 'Failed to open email app');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Share Location</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.locationCard}>
          <Text style={styles.cardTitle}>📍 Current Location</Text>
          
          {isLoading ? (
            <Text style={styles.loadingText}>Getting location...</Text>
          ) : currentLocation ? (
            <View>
              <View style={styles.locationInfo}>
                <Text style={styles.label}>Latitude:</Text>
                <Text style={styles.value}>{currentLocation.latitude.toFixed(6)}</Text>
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.label}>Longitude:</Text>
                <Text style={styles.value}>{currentLocation.longitude.toFixed(6)}</Text>
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.label}>Accuracy:</Text>
                <Text style={styles.value}>{currentLocation.accuracy.toFixed(0)}m</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.errorText}>Location not available</Text>
          )}
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={getLocation}>
          <Text style={styles.refreshButtonText}>🔄 Refresh Location</Text>
        </TouchableOpacity>

        <View style={styles.sharingOptions}>
          <Text style={styles.sectionTitle}>Share Options</Text>
          
          <TouchableOpacity style={styles.shareButton} onPress={shareLocation}>
            <Text style={styles.shareButtonText}>📤 Share Location</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareButton} onPress={shareViaEmail}>
            <Text style={styles.shareButtonText}>📧 Share via Email</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareButton} onPress={copyLocation}>
            <Text style={styles.shareButtonText}>📋 Copy Location Details</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareButton} onPress={openInMaps}>
            <Text style={styles.shareButtonText}>🗺️ Open in Maps</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ How it works:</Text>
          <Text style={styles.infoText}>
            • Share your current location with friends and family{'\n'}
            • Choose from multiple sharing options{'\n'}
            • Recipients can view your location on Google Maps{'\n'}
            • Location is shared in real-time
          </Text>
        </View>

      </ScrollView>
    </View>
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
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  locationCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
  },
  locationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '600',
  },
  sharingOptions: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  shareButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButtonText: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 20,
  },
  refreshButton: {
    backgroundColor: '#17a2b8',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LocationSharingScreen;
