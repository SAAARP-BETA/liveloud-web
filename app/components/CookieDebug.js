'use client';

import { getCookie } from '@/backend/utils/authUtils';
import { useEffect, useState } from 'react';

export default function CookieDebug() {
  const [cookies, setCookies] = useState('');
  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCookies(document.cookie);
    }
  }, []);

  const clearAllCookies = () => {
    if (typeof window !== 'undefined') {
      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
      setCookies('');
      window.location.reload();
    }
  };

  return (
    <div className="p-4 border rounded bg-gray-50 mt-4">
      <h3 className="font-bold mb-2">Cookie Debug</h3>
      
      <div className="mb-2">
        <strong>All Cookies:</strong>
        <pre className="bg-white p-2 rounded border text-xs mt-1">
          {cookies || 'No cookies set'}
        </pre>
      </div>
      
      <button 
        onClick={clearAllCookies}
        className="bg-red-500 text-white px-3 py-1 rounded text-sm"
      >
        Clear All Cookies
      </button>
    </div>
  );
}
