// utils/authUtils.js

// Detects if the code is running in the browser
const isBrowser = typeof window !== 'undefined';

/**
 * Fetches authenticated user data from the backend using cookies.
 * This replaces the old localStorage-based method.
 */
const getAuthData = async () => {
  if (!isBrowser) return { user: null, token: null };

  try {
    const response = await fetch('http://localhost:3000/api/auth/profile', {
      method: 'GET',
      credentials: 'include', // IMPORTANT: Send cookies
    });

    if (!response.ok) throw new Error('Not authenticated');

    const user = await response.json();
    return { user, token: null }; // No need to handle tokens manually now
  } catch {
    return { user: null, token: null };
  }
};

// These are no-ops now, included only for compatibility
const storeAuthData = async () => {};
const clearAuthData = async () => {};
const generateToken = () => null;
const verifyToken = () => null;
const isTokenExpired = () => false;
const base64UrlEncode = () => null;
const base64UrlDecode = () => null;

export {
  getAuthData,
  storeAuthData,
  clearAuthData,
  generateToken,
  verifyToken,
  isTokenExpired,
  base64UrlEncode,
  base64UrlDecode,
};
