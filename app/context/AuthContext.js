'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '@/backend/api/routes/authService.mjs';
import { getAuthData, clearAuthData, storeAuthData } from '@/backend/utils/authUtils';

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  login: () => {},
  signup: () => {},
  logout: () => { },
  updateUserInfo : ()=>{},
  getProfile: () => {},
  clearError: () => {},
});

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    token:null, //solved issue in creating post (setting the token)
    isAuthenticated: false,
    
    loading: true,
  });

  const [error, setError] = useState(null);

  // Load profile from localStorage and validate with backend on first render
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('AuthContext: Initializing authentication...');
        
        // First check if we have stored auth data
        const storedAuthData = await getAuthData();
        console.log('AuthContext: Stored auth data:', { 
          hasToken: !!storedAuthData.token,
          hasUser: !!storedAuthData.user,
          tokenLength: storedAuthData.token?.length,
          userId: storedAuthData.user?._id 
        });
        
        if (storedAuthData.token && storedAuthData.user) {
          // We have stored data, try to validate with server
          try {
            console.log('AuthContext: Validating token with server...');
            const profile = await authService.getProfile();
            console.log('AuthContext: Profile fetch result:', { 
              hasProfile: !!profile,
              profileId: profile?._id 
            });
            
            if (profile?._id) {
              setAuthState({
                user: profile,
                token: storedAuthData.token, // Ensure we set the token
                isAuthenticated: true,
                loading: false,
              });
              console.log('AuthContext: Authentication successful');
              return;
            }
          } catch (err) {
            console.warn('AuthContext: Stored token invalid, clearing auth data:', err);
            await clearAuthData();
          }
        }
        
        // No valid stored data or validation failed
        console.log('AuthContext: No valid auth data, setting unauthenticated state');
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
  // ------------------ SIGNUP ------------------
const signup = async (userData) => {
  setError(null);
  setAuthState((prev) => ({ ...prev, loading: true }));
  try {
    const response = await authService.signup(userData);
    
    setAuthState({
      user: null,              
      token: null,           
      isAuthenticated: false, 
      loading: false,
    });
    
    return true;
  } catch (err) {
    console.error('Signup error:', err);
    setError(err.message || 'Signup failed');
    setAuthState((prev) => ({ 
      ...prev, 
      loading: false,
      user: null,
      token: null,
      isAuthenticated: false 
    }));
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

   // Update user info function
  const updateUserInfo = async (newUserData) => {
    try {
      console.log('Updating user info in context:', newUserData);
      
      setAuthState(prev => ({
        ...prev,
        user: {
          ...prev.user,
          ...newUserData
        }
      }));
      
      // Also update AsyncStorage with new user data
      if (authState.token && newUserData) {
        await storeAuthData(authState.token, {
          ...authState.user,
          ...newUserData
        });
      }
      
      return true;
    } catch (err) {
      console.error('Update user info error:', err);
      return false;
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

  // Method to set authentication data directly (for OAuth callbacks)
  const setAuthData = async (token, user) => {
    try {
      console.log('setAuthData called with:', { 
        hasToken: !!token, 
        tokenLength: token?.length,
        hasUser: !!user,
        userId: user?._id 
      });
      
      await storeAuthData(token, user);
      
      // Verify the data was stored
      const verifyStored = await getAuthData();
      console.log('Verification - stored data:', { 
        hasStoredToken: !!verifyStored.token,
        hasStoredUser: !!verifyStored.user,
        storedUserId: verifyStored.user?._id 
      });
      
      setAuthState({
        user: user,
        token: token,
        isAuthenticated: true,
        loading: false
      });
      console.log('Auth state set successfully:', { hasUser: !!user, hasToken: !!token });
    } catch (error) {
      console.error('Failed to set auth data:', error);
      setError('Failed to complete authentication');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        error,
        login,
        signup,
        logout,
        updateUserInfo,
        getProfile,
        clearError,
        setAuthData, // Add this new method
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
