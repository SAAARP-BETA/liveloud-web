/**
 * Google OAuth utilities for web app
 */

// Initialize Google OAuth
export const initGoogleAuth = () => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null);
      return;
    }

    // Check if Google API is already loaded
    if (window.google && window.google.accounts) {
      resolve(window.google);
      return;
    }

    // Load Google API script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => {
      // Initialize Google Sign-In
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: () => {}, // This will be overridden when calling signIn
      });
      resolve(window.google);
    };
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
};

export const signInWithGoogle = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Google Sign-In is only available in browser'));
      return;
    }

    if (!window.google || !window.google.accounts) {
      reject(new Error('Google API not loaded'));
      return;
    }

    // Configure the callback
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: (response) => {
        if (response.credential) {
          resolve(response.credential); // This is the ID token
        } else {
          reject(new Error('No credential received from Google'));
        }
      },
    });

    // Trigger the sign-in popup
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Fallback to programmatic sign-in
        window.google.accounts.id.renderButton(
          document.createElement('div'), // temporary element
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
          }
        );
        
        // Use the OAuth2 popup flow instead
        window.google.accounts.oauth2.initTokenClient({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          scope: 'openid email profile',
          callback: (tokenResponse) => {
            if (tokenResponse.access_token) {
              // We need to get the ID token, so we'll use a different approach
              getUserInfo(tokenResponse.access_token)
                .then(userInfo => resolve(userInfo))
                .catch(reject);
            } else {
              reject(new Error('No access token received'));
            }
          },
        }).requestAccessToken();
      }
    });
  });
};

// Alternative approach using Google's OAuth2 API directly
export const signInWithGooglePopup = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Google Sign-In is only available in browser'));
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    
    const scope = 'openid email profile';
    const responseType = 'code';
    const state = Math.random().toString(36).substring(2, 15);
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=${responseType}&` +
      `state=${state}`;

    // Open popup
    const popup = window.open(authUrl, 'google-auth', 'width=500,height=600');
    
    // Listen for the popup to close
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        reject(new Error('Authentication cancelled'));
      }
    }, 1000);

    // Listen for messages from the popup
    const messageHandler = (event) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
        popup.close();
        resolve(event.data.credential);
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
        popup.close();
        reject(new Error(event.data.error || 'Google authentication failed'));
      }
    };

    window.addEventListener('message', messageHandler);
  });
};

// Simpler approach: Use Google One Tap
export const handleGoogleOneTap = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Google Sign-In is only available in browser'));
      return;
    }

    initGoogleAuth().then((google) => {
      if (!google) {
        reject(new Error('Failed to load Google API'));
        return;
      }

      google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response.credential) {
            resolve(response.credential);
          } else {
            reject(new Error('No credential received'));
          }
        },
      });

      google.accounts.id.prompt();
    });
  });
};

// Get user info from access token (fallback method)
const getUserInfo = async (accessToken) => {
  const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`);
  if (!response.ok) {
    throw new Error('Failed to get user info');
  }
  return response.json();
};
