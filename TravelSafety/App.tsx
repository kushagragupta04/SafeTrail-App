/**
 * TravelSafety App
 * A comprehensive travel safety application with location tracking and emergency features
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import SimpleNavigator from './src/navigation/SimpleNavigator';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor="#f8f9fa"
      />
      <AuthProvider>
        <SimpleNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
