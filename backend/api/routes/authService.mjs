import { API_ENDPOINTS } from '@/app/utils/config';

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
      });

      const data = await response.json();

      if (!response.ok) {
        throw new AuthenticationError(
          data.message || 'Signup failed',
          data.code || 'SIGNUP_FAILED'
        );
      }

      return data; // { user, token, message }
    } catch (error) {
      throw error instanceof AuthenticationError
        ? error
        : new AuthenticationError(error.message, 'SIGNUP_FAILED');
    }
  },

  // ----------------- LOGIN -----------------
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new AuthenticationError(
          data.message || 'Login failed',
          data.code || 'LOGIN_FAILED'
        );
      }

      return data; // { user, token }
    } catch (error) {
      throw error instanceof AuthenticationError
        ? error
        : new AuthenticationError(error.message, 'LOGIN_FAILED');
    }
  },

  // ----------------- GET PROFILE -----------------
  getProfile: async (token) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH}/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
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

  // ----------------- VALIDATE TOKEN -----------------
  validate: async (token) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH}/validate`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new AuthenticationError(
          data.message || 'Token validation failed',
          data.code || 'VALIDATION_FAILED'
        );
      }

      return data; // { valid: true, user: {...} }
    } catch (error) {
      throw error instanceof AuthenticationError
        ? error
        : new AuthenticationError(error.message, 'VALIDATION_FAILED');
    }
  },

  // ----------------- LOGOUT -----------------
  logout: async (token) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH}/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new AuthenticationError(
          data.message || 'Logout failed',
          data.code || 'LOGOUT_FAILED'
        );
      }

      return data; // { message: "Logged out successfully" }
    } catch (error) {
      throw error instanceof AuthenticationError
        ? error
        : new AuthenticationError(error.message, 'LOGOUT_FAILED');
    }
  },
};

export default authService;
