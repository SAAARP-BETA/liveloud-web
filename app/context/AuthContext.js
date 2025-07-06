'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '@/backend/api/routes/authService.mjs';
import { getAuthData, clearAuthData } from '@/backend/utils/authUtils';

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  login: () => {},
  signup: () => {},
  logout: () => {},
  getProfile: () => {},
  clearError: () => {},
});

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
    token:null,
    loading: true,
  });

  const [error, setError] = useState(null);

  // Load profile from localStorage and validate with backend on first render
  useEffect(() => {
    const initAuth = async () => {
      try {
        // First check if we have stored auth data
        const storedAuthData = await getAuthData();
        
        if (storedAuthData.token && storedAuthData.user) {
          // We have stored data, try to validate with server
          try {
            const profile = await authService.getProfile();
            if (profile?._id) {
              setAuthState({
                user: profile,
                token: storedAuthData.token,
                isAuthenticated: true,
                loading: false,
              });
              return;
            }
          } catch (err) {
            console.warn('Stored token invalid, clearing auth data');
            await clearAuthData();
          }
        }
        
        // No valid stored data or validation failed
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
        });
      } catch (err) {
        console.error('Auth init failed:', err);
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    };

    initAuth();
  }, []);

  // ------------------ LOGIN ------------------
  // const login = async (email, password) => {
  //   setError(null);
  //   setAuthState((prev) => ({ ...prev, loading: true }));
  //   try {
  //     const response = await authService.login(email, password);
  //     setAuthState({
  //       user: response.user,
  //       isAuthenticated: true,
  //       loading: false,
  //     });
  //     return true;
  //   } catch (err) {
  //     console.error('Login error:', err);
  //     setError(err.message || 'Login failed');
  //     setAuthState((prev) => ({ ...prev, loading: false }));
  //     return false;
  //   }
  // };

  const login = async (email, password) => {
    setError(null);
    try {
      console.log('Attempting Login...');
      const response = await authService.login(email, password);
      console.log('Login successful, received:', {
        hasUser: !!response.user,
        hasToken: !!response.token,
        tokenLength: response.token?.length
      });
      
      setAuthState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        loading: false
      });
      
      return true;
    } catch (err) {
      console.error('Login error in context:', err);
      setError(err.message || 'Login failed');
      return false;
    }
  };

  // ------------------ SIGNUP ------------------
  const signup = async (userData) => {
    setError(null);
    setAuthState((prev) => ({ ...prev, loading: true }));
    try {
      const response = await authService.signup(userData);
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        loading: false,
      });
      return true;
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Signup failed');
      setAuthState((prev) => ({ ...prev, loading: false }));
      return false;
    }
  };

  // ------------------ LOGOUT ------------------
  const logout = async () => {
    try {
      await authService.logout(); 
    } catch (err) {
      console.error('Logout error:', err);
      await clearAuthData();
    } finally {
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  };

  // ------------------ GET PROFILE ------------------
  const getProfile = async () => {
    try {
      const profile = await authService.getProfile();
      if (!profile || !profile._id) throw new Error('Invalid profile');
      setAuthState((prev) => ({
        ...prev,
        user: profile,
      }));
      return profile;
    } catch (err) {
      console.error('Get profile error:', err);
      await clearAuthData();
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
      setError('Session expired. Please log in again.');
      return null;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        error,
        login,
        signup,
        logout,
        getProfile,
        clearError,
      }}
    >
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
