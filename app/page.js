'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext'; 

export default function HomeRedirect() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  console.log(isAuthenticated);
  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace('/login'); // Next.js path 
    } else if (isAuthenticated === true) {
      router.replace('/home');
    }
  }, [isAuthenticated]);

  return null; // no UI
}