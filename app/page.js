'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext'; // Adjust path as needed

export default function HomeRedirect() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace('/login'); // Next.js path (adjust if needed)
    } else if (isAuthenticated === true) {
      router.replace('/home');
    }
  }, [isAuthenticated]);

  return null; // no UI
}