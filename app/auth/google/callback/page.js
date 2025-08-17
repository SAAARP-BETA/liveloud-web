'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

export default function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuthData } = useAuth();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState('');
  const hasProcessed = useRef(false); // Prevent multiple executions

  useEffect(() => {
    const handleGoogleCallback = async () => {
      // Prevent multiple executions
      if (hasProcessed.current) {
        console.log('Google callback already processed, skipping...');
        return;
      }

      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        console.log('Processing Google callback with:', { 
          hasCode: !!code, 
          state, 
          error,
          processed: hasProcessed.current 
        });

        if (error) {
          setError(`Google authentication failed: ${error}`);
          setStatus('error');
          hasProcessed.current = true;
          return;
        }

        if (!code) {
          setError('No authorization code received from Google');
          setStatus('error');
          hasProcessed.current = true;
          return;
        }

        // Mark as processed before making the request
        hasProcessed.current = true;
        setStatus('exchanging_code');

        // Exchange the code for an access token and user info
        console.log('Sending code to backend:', code);
        const response = await fetch('/api/auth/google/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state }),
        });

        const data = await response.json();
        console.log('Backend response:', response.status, data);

        if (!response.ok) {
          console.error('Backend error:', data);
          setError(data.message || 'Failed to authenticate with Google');
          setStatus('error');
          // Reset processed flag on error so user can retry
          hasProcessed.current = false;
          return;
        }

        // Store the auth data using AuthContext method
        await setAuthData(data.token, data.user);
        console.log('Auth data stored successfully');

        setStatus('success');
        
        // Redirect to home page - no need for full page refresh since AuthContext is updated
        setTimeout(() => {
          router.push('/home');
        }, 1000);

      } catch (err) {
        console.error('Google callback error:', err);
        setError('An unexpected error occurred during authentication');
        setStatus('error');
        // Reset processed flag on error so user can retry
        hasProcessed.current = false;
      }
    };

    handleGoogleCallback();
  }, [searchParams, router, setAuthData]);

  const getStatusMessage = () => {
    switch (status) {
      case 'processing':
        return 'Processing Google authentication...';
      case 'exchanging_code':
        return 'Verifying with Google...';
      case 'success':
        return 'Authentication successful! Redirecting...';
      case 'error':
        return error;
      default:
        return 'Processing...';
    }
  };

  const handleRetry = () => {
    hasProcessed.current = false; // Reset the flag to allow retry
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            {status === 'success' ? (
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : status === 'error' ? (
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'success' ? 'Welcome!' : status === 'error' ? 'Authentication Failed' : 'Authenticating...'}
          </h1>
          
          <p className="text-gray-600">
            {getStatusMessage()}
          </p>
        </div>

        {status === 'error' && (
          <div className="space-y-4">
            <button
              onClick={handleRetry}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/signup')}
              className="w-full text-blue-500 hover:text-blue-600 transition-colors"
            >
              Create New Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
