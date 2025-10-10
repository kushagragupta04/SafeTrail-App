import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, testConnection } from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    // Test backend connection first
    const connectionTest = await testConnection();
    if (!connectionTest.success) {
      console.warn('⚠️ Backend connection failed, but continuing...');
    }
    
    // Then check auth state
    await checkAuthState();
  };

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token },
        });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email, password) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        await AsyncStorage.setItem('authToken', response.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.user));
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.user,
            token: response.token,
          },
        });
        
        // Refresh user data to get latest emergency contacts
        setTimeout(async () => {
          try {
            const userResponse = await authAPI.getCurrentUser();
            if (userResponse.success) {
              await AsyncStorage.setItem('userData', JSON.stringify(userResponse.user));
              dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                  user: userResponse.user,
                  token: response.token,
                },
              });
            }
          } catch (error) {
            console.log('Error refreshing user data:', error);
          }
        }, 1000);
        
        return { success: true, message: response.message };
      } else {
        dispatch({ type: 'LOGIN_FAILURE' });
        return { success: false, message: response.message };
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const value = {
    ...state,
    login,
    logout,
    checkAuthState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
