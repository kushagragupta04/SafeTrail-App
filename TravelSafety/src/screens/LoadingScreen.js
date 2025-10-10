import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TravelSafety</Text>
      <ActivityIndicator size="large" color="#3498db" style={styles.loader} />
      <Text style={styles.subtitle}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
});

export default LoadingScreen;
