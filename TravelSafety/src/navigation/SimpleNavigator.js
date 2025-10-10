import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import EmergencyContactsScreen from '../screens/EmergencyContactsScreen';
import LocationSharingScreen from '../screens/LocationSharingScreen';
import SafetySettingsScreen from '../screens/SafetySettingsScreen';
import LoadingScreen from '../screens/LoadingScreen';

const SimpleNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('login');

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    if (currentScreen === 'emergency-contacts') {
      return (
        <EmergencyContactsScreen 
          onBack={() => setCurrentScreen('dashboard')}
        />
      );
    }
    
    if (currentScreen === 'location-sharing') {
      return (
        <LocationSharingScreen 
          onBack={() => setCurrentScreen('dashboard')}
        />
      );
    }
    
    if (currentScreen === 'safety-settings') {
      return (
        <SafetySettingsScreen 
          navigation={{ goBack: () => setCurrentScreen('dashboard') }}
        />
      );
    }
    
    return (
      <DashboardScreen 
        onNavigateToEmergencyContacts={() => setCurrentScreen('emergency-contacts')}
        onNavigateToLocationSharing={() => setCurrentScreen('location-sharing')}
        onNavigateToSafetySettings={() => setCurrentScreen('safety-settings')}
      />
    );
  }

  if (currentScreen === 'register') {
    return (
      <RegisterScreen 
        onNavigateToLogin={() => setCurrentScreen('login')}
      />
    );
  }

  return (
    <LoginScreen 
      onNavigateToRegister={() => setCurrentScreen('register')}
    />
  );
};

export default SimpleNavigator;
