const isBrowser = typeof window !== 'undefined';


const setCookie = (name, value, days = 7, options = {}) => {
  if (!isBrowser) return;
  
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    
    const cookieOptions = {
      expires: expires.toUTCString(),
      path: '/',
      secure: window.location.protocol === 'https:',
      sameSite: 'lax',
      ...options
    };
    
    let cookieString = `${name}=${encodeURIComponent(value)}`;
    
    Object.entries(cookieOptions).forEach(([key, val]) => {
      if (val === true) {
        cookieString += `; ${key}`;
      } else if (val !== false && val !== null && val !== undefined) {
        cookieString += `; ${key}=${val}`;
      }
    });
    
    document.cookie = cookieString;
  } catch (error) {
    console.error('Failed to set cookie:', error);
  }
};

/**
 * Get a cookie value by name
 */
const getCookie = (name) => {
  if (!isBrowser) return null;
  
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return decodeURIComponent(parts.pop().split(';').shift());
    }
  } catch (error) {
    console.error('Failed to get cookie:', error);
  }
  return null;
};

/**
 * Delete a cookie by name
 */
const deleteCookie = (name) => {
  if (!isBrowser) return;
  
  try {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  } catch (error) {
    console.error('Failed to delete cookie:', error);
  }
};


const storeAuthData = async (token, user) => {
  if (!isBrowser) return;
  
  try {
    if (token) {
      setCookie('authToken', token, 7); // 7 days expiry
    }
    if (user) {
      setCookie('userData', JSON.stringify(user), 7);
    }
  } catch (error) {
    console.error('Failed to store auth data:', error);
  }
};

/**
 * Get authentication data from cookies
 */
const getAuthData = async () => {
  if (!isBrowser) return { user: null, token: null };

  try {
    const token = getCookie('authToken');
    const userData = getCookie('userData');
    
    return {
      token,
      user: userData ? JSON.parse(userData) : null
    };
  } catch (error) {
    console.error('Failed to get auth data:', error);
    return { user: null, token: null };
  }
};

const clearAuthData = async () => {
  if (!isBrowser) return;
  
  try {
    deleteCookie('authToken');
    deleteCookie('userData');
  } catch (error) {
    console.error('Failed to clear auth data:', error);
  }
};

const getAuthToken = () => {
  if (!isBrowser) return null;
  return getCookie('authToken');
};

const generateToken = () => null;
const verifyToken = () => null;
const isTokenExpired = () => false;
const base64UrlEncode = () => null;
const base64UrlDecode = () => null;

export {
  getAuthData,
  storeAuthData,
  clearAuthData,
  getAuthToken,
  setCookie,
  getCookie,
  deleteCookie,
  generateToken,
  verifyToken,
  isTokenExpired,
  base64UrlEncode,
  base64UrlDecode,
};
