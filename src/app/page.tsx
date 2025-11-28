'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token) {
      // Redirect based on user role
      if (userData) {
        const user = JSON.parse(userData);
        if (user.role === 'Administrator') {
          router.push('/dashboard');
        } else {
          router.push('/home');
        }
      } else {
        router.push('/home');
      }
    } else {
      router.push('/register');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Redirecting...</p>
    </div>
  );
}
