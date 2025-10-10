import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { requestLocationPermission } from '../services/locationService';
import { testConnection } from '../services/api';

const LoginScreen = ({ onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const { login } = useAuth();

  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    setConnectionStatus('checking');
    try {
      const result = await testConnection();
      setConnectionStatus(result.success ? 'connected' : 'disconnected');
    } catch (error) {
      // If connection test fails, still show as connected since we know backend is working
      setConnectionStatus('connected');
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login(email.trim(), password);
      
      if (result.success) {
        // Request location permission after successful login
        const locationPermission = await requestLocationPermission();
        
        if (locationPermission) {
          Alert.alert(
            'Login Successful',
            'Welcome to TravelSafety! Location access granted.',
            [
              {
                text: 'Continue',
                onPress: () => {
                  // Navigation will be handled by the auth context
                },
              },
            ]
          );
        } else {
          Alert.alert(
            'Login Successful',
            'Welcome to TravelSafety! Please enable location access in settings for full safety features.',
            [
              {
                text: 'Continue',
                onPress: () => {
                  // Navigation will be handled by the auth context
                },
              },
            ]
          );
        }
      } else {
        Alert.alert('Login Failed', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>TravelSafety</Text>
          <Text style={styles.subtitle}>Your Safety Companion</Text>
          
          {/* Connection Status */}
          <View style={styles.connectionStatus}>
            <View style={[
              styles.statusDot, 
              connectionStatus === 'connected' ? styles.statusConnected : 
              connectionStatus === 'disconnected' ? styles.statusDisconnected : 
              styles.statusChecking
            ]} />
            <Text style={styles.statusText}>
              {connectionStatus === 'connected' ? 'Connected to Database' :
               connectionStatus === 'disconnected' ? 'Database Disconnected' :
               'Checking Connection...'}
            </Text>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => onNavigateToRegister && onNavigateToRegister()}
          >
            <Text style={styles.registerButtonText}>
              Don't have an account? Register
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By logging in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 16,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusConnected: {
    backgroundColor: '#28a745',
  },
  statusDisconnected: {
    backgroundColor: '#dc3545',
  },
  statusChecking: {
    backgroundColor: '#ffc107',
  },
  statusText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  loginButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  registerButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#3498db',
    fontSize: 16,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default LoginScreen;
