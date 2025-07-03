import { API_ENDPOINTS } from '@/app/utils/config';
import { storeAuthData, getAuthToken, clearAuthData } from '@/backend/utils/authUtils';

// Custom error class
class AuthenticationError extends Error {
  constructor(message, code, originalError = null) {
    super(message);
    this.name = 'AuthenticationError';
    this.code = code;
    this.originalError = originalError;
  }
}

const authService = {
  // ----------------- SIGNUP -----------------
  signup: async ({ username, email, password }) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
        credentials: 'include', // ✅ cookie will be set by backend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new AuthenticationError(
          data.message || 'Signup failed',
          data.code || 'SIGNUP_FAILED'
        );
      }

      return data; // { user, token?, message }
    } catch (error) {
      throw error instanceof AuthenticationError
        ? error
        : new AuthenticationError(error.message, 'SIGNUP_FAILED');
    }
  },

  // ----------------- LOGIN -----------------
  // login: async (email, password) => {
  //   try {
  //     const response = await fetch(`${API_ENDPOINTS.AUTH}/login`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ email, password }),
  //       credentials: 'include', // ✅ cookie will be set
  //     });

  //     const data = await response.json();

  //     if (!response.ok) {
  //       throw new AuthenticationError(
  //         data.message || 'Login failed',
  //         data.code || 'LOGIN_FAILED'
  //       );
  //     }
  //     await storeAuthData(data.token, data.user);
      
  //     return data; // { user }
  //   } catch (error) {
  //     throw error instanceof AuthenticationError
  //       ? error
  //       : new AuthenticationError(error.message, 'LOGIN_FAILED');
  //   }
  // },

  login: async (email, password) => {
    try {
      if (!email || !password) {
        throw new AuthenticationError('Email and password are required', 'INVALID_INPUT');
      }
      console.log('API_URL: ');
      const response = await fetch(`${API_ENDPOINTS.AUTH}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        timeout: 10000,
        credentials: 'omit',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new AuthenticationError(
          data.message || 'Invalid credentials',
          data.code || 'LOGIN_FAILED'
        );
      }

      await storeAuthData(data.token, data.user);

      return {
        user: data.user,
        token: data.token
      };
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new AuthenticationError(
          'Unable to connect to the server',
          'NETWORK_ERROR'
        );
      }

      if (error instanceof AuthenticationError) {
        throw error;
      }

      throw new AuthenticationError(
        error.message || 'Invalid credentials',
        error.code || 'LOGIN_FAILED'
      );
    }
  },

  // ----------------- GET PROFILE -----------------
  getProfile: async () => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new AuthenticationError(
          'No authentication token found',
          'NO_TOKEN'
        );
      }

      const response = await fetch(`${API_ENDPOINTS.AUTH}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new AuthenticationError(
          data.message || 'Profile fetch failed',
          data.code || 'PROFILE_FETCH_FAILED'
        );
      }

      return data; // user object
    } catch (error) {
      throw error instanceof AuthenticationError
        ? error
        : new AuthenticationError(error.message, 'PROFILE_FETCH_FAILED');
    }
  },

  // ----------------- VALIDATE SESSION -----------------
  validate: async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH}/validate`, {
        method: 'GET',
        credentials: 'include', 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new AuthenticationError(
          data.message || 'Token validation failed',
          data.code || 'VALIDATION_FAILED'
        );
      }

      return data; 
    } catch (error) {
      throw error instanceof AuthenticationError
        ? error
        : new AuthenticationError(error.message, 'VALIDATION_FAILED');
    }
  },

  // ----------------- LOGOUT -----------------
  logout: async () => {
    try {
      const token = getAuthToken();
      
      await clearAuthData();
      
      if (!token) {
        return { message: "Logged out successfully" };
      }

      const response = await fetch(`${API_ENDPOINTS.AUTH}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.warn('Server logout failed, but local data cleared');
      }

      return data || { message: "Logged out successfully" };
    } catch (error) {
      console.warn('Logout error:', error);
      return { message: "Logged out successfully" };
    }
  },
};

export default authService;
