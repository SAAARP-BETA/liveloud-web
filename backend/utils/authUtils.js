// Converted version of AuthUtils for Next.js (Node/browser-compatible)

import CryptoJS from 'crypto-js';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// LocalStorage fallback helpers for browser
const isBrowser = typeof window !== 'undefined';

// Helper to decode base64url
const base64UrlDecode = (str) => {
  try {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const decoded = atob(padded);
    return decodeURIComponent(escape(decoded));
  } catch (error) {
    throw new Error('Invalid token format');
  }
};

// Helper to encode base64url
const base64UrlEncode = (str) => {
  try {
    const base64 = btoa(unescape(encodeURIComponent(str)));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (error) {
    throw new Error('Invalid string for encoding');
  }
};

const verifyToken = (token, secret) => {
  if (!token || !secret) throw new Error('Token or secret missing');

  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token format');

  const [headerB64, payloadB64, receivedSig] = parts;
  const data = `${headerB64}.${payloadB64}`;
  const expectedSig = CryptoJS.HmacSHA256(data, secret)
    .toString(CryptoJS.enc.Base64)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  if (expectedSig !== receivedSig) throw new Error('Invalid signature');

  const payload = JSON.parse(base64UrlDecode(payloadB64));

  if (payload.exp && Date.now() >= payload.exp * 1000) {
    const error = new Error('Token expired');
    error.name = 'TokenExpiredError';
    error.expiredAt = new Date(payload.exp * 1000);
    throw error;
  }

  return payload;
};

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(base64UrlDecode(token.split('.')[1]));
    return payload.exp ? Date.now() >= payload.exp * 1000 : false;
  } catch {
    return true;
  }
};

const generateToken = (payload, secret, expiresIn = '7d') => {
  const now = Math.floor(Date.now() / 1000);
  let seconds = 7 * 24 * 60 * 60; // default 7d

  if (typeof expiresIn === 'string') {
    const [, num, unit] = expiresIn.match(/(\d+)([smhdw])/i) || [];
    const value = parseInt(num);
    if (!isNaN(value)) {
      switch (unit) {
        case 's': seconds = value; break;
        case 'm': seconds = value * 60; break;
        case 'h': seconds = value * 3600; break;
        case 'd': seconds = value * 86400; break;
        case 'w': seconds = value * 604800; break;
      }
    }
  }

  const finalPayload = { ...payload, iat: now, exp: now + seconds };
  const header = { alg: 'HS256', typ: 'JWT' };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(finalPayload));
  const data = `${headerB64}.${payloadB64}`;
  const signature = CryptoJS.HmacSHA256(data, secret)
    .toString(CryptoJS.enc.Base64)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `${data}.${signature}`;
};

// Store token + user in localStorage
const storeAuthData = async (token, user) => {
  if (!isBrowser) return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const getAuthData = async () => {
  if (!isBrowser) return { token: null, user: null };
  const token = localStorage.getItem(TOKEN_KEY);
  const userJson = localStorage.getItem(USER_KEY);
  return {
    token,
    user: userJson ? JSON.parse(userJson) : null,
  };
};

const clearAuthData = async () => {
  if (!isBrowser) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export {
  verifyToken,
  isTokenExpired,
  generateToken,
  storeAuthData,
  getAuthData,
  clearAuthData,
  base64UrlEncode,
  base64UrlDecode,
};
