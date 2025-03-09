'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle } from 'lucide-react';
import AuthRequiredDialog from '@/components/common/AuthRequiredDialog';

export default function CreateReportPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading, checkAuth } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  // Add logging for debugging authentication state
  useEffect(() => {
    console.log('Auth state in CreateReportPage:', {
      isAuthenticated,
      user: !!user,
      isLoading,
      authChecked
    });
  }, [isAuthenticated, user, isLoading, authChecked]);
  
  useEffect(() => {
    // Check authentication status
    const verifyAuth = async () => {
      try {
        console.log('Starting authentication verification in CreateReportPage');
        const isAuth = await checkAuth();
        console.log('Authentication result in CreateReportPage:', isAuth);
        setAuthChecked(true);
      } catch (err) {
        console.error('Authentication check failed in CreateReportPage:', err);
        setError('Authentication check failed. Please try again.');
        setAuthChecked(true);
      }
    };
    
    if (!authChecked && !isLoading) {
      verifyAuth();
    }
  }, [checkAuth, authChecked, isLoading]);
  
  useEffect(() => {
    // Only redirect or show dialog after auth check is complete and not loading
    if (authChecked && !isLoading) {
      console.log('Auth check finished. Authenticated:', isAuthenticated);
      
      if (isAuthenticated && user) {
        // User is definitely authenticated, redirect to location
        console.log('User is authenticated, redirecting to location selection');
        router.push('/report/create/location');
      } else if (!isAuthenticated) {
        // Only show auth dialog if we're certain user is not authenticated
        console.log('User is not authenticated, showing auth dialog');
        setShowAuthDialog(true);
      }
    }
  }, [authChecked, isAuthenticated, user, isLoading, router]);
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col items-center justify-center">
      {/* Auth Required Dialog */}
      <AuthRequiredDialog 
        isOpen={showAuthDialog}
        setIsOpen={setShowAuthDialog}
        title="Authentication Required"
        message="You need to be logged in to report an issue. Please log in or create an account to continue."
        returnUrl="/report/create"
      />
      
      {error ? (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md flex items-start gap-3 mb-4">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <p className="text-red-700">{error}</p>
            <p className="text-red-600 text-sm mt-1">Please refresh the page or try logging in again.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">Preparing report form...</p>
        </>
      )}
    </div>
  );
} 