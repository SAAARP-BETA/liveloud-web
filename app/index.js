// app/page.js or app/index/page.js (Next.js App Router)
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext'; // Adjust path as needed

export default function HomeRedirect() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/auth/login'); // Next.js path (adjust if needed)
    } else if (isAuthenticated === true) {
      router.push('/app/home/homepage');
    }
  }, [isAuthenticated]);

  return null; // no UI
}
