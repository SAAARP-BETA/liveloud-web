'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '@/backend/api/routes/authService.mjs'; // Adjust path if needed
import { getAuthData } from '@/backend/utils/authUtils'; // Adjust path if needed

export const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  login: () => {},
  signup: () => {},
  logout: () => {},
  refreshToken: () => {},
  getProfile: () => {},
  clearError: () => {},
});

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const authData = getAuthData();

        if (authData?.token && authData?.user) {
          setAuthState({
            user: authData.user,
            token: authData.token,
            isAuthenticated: true,
            loading: false,
          });

          const isValid = await authService.isAuthenticated();
          if (!isValid) await logout();
        } else {
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      } catch (err) {
        console.error('Auth init failed:', err);
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await authService.login(email, password);
      setAuthState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        loading: false,
      });
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
      return false;
    }
  };

  const signup = async (userData) => {
    setError(null);
    try {
      const response = await authService.signup(userData);
      setAuthState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        loading: false,
      });
      return true;
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Signup failed');
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  };

  const refreshToken = async () => {
    try {
      const response = await authService.refreshToken();
      setAuthState((prev) => ({
        ...prev,
        token: response.token,
        user: response.user,
      }));
      return true;
    } catch (err) {
      console.error('Token refresh error:', err);
      await logout();
      setError('Session expired. Please log in again.');
      return false;
    }
  };

  const getProfile = async () => {
    try {
      const profile = await authService.getProfile();
      setAuthState((prev) => ({
        ...prev,
        user: profile,
      }));
      return profile;
    } catch (err) {
      console.error('Get profile error:', err);
      await logout();
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
        refreshToken,
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
