'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackUrl?: string;
}

export default function ProtectedRoute({ 
  children, 
  fallbackUrl = '/login' 
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, checkAuth } = useAuth();

  useEffect(() => {
    // Ensure auth status is checked immediately
    checkAuth();
    
    // If user is not logged in and loading is complete, redirect to login page
    if (!isLoading && !isAuthenticated) {
      router.replace(fallbackUrl);
    }
  }, [isAuthenticated, isLoading, router, fallbackUrl, checkAuth]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, don't render children
  if (!isAuthenticated) {
    return null;
  }

  // User is authenticated, render children
  return <>{children}</>;
} 