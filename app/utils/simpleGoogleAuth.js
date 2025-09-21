/**
 * Simple Google OAuth for web
 */

export const initiateGoogleAuth = () => {
  if (typeof window === 'undefined') return;
  
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/google/callback`;
  const scope = 'openid email profile';
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `response_type=code&` +
    `state=${Math.random().toString(36).substring(2, 15)}`;
  
  window.location.href = authUrl;
};
