'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AuthRequiredDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  title?: string;
  message?: string;
  returnUrl?: string;
}

export default function AuthRequiredDialog({
  isOpen,
  setIsOpen,
  title = 'Authentication Required',
  message = 'You need to be logged in to access this feature.',
  returnUrl = '',
}: AuthRequiredDialogProps) {
  const router = useRouter();
  
  // Add logging for when dialog state changes
  useEffect(() => {
    console.log('AuthRequiredDialog state:', { isOpen, returnUrl });
  }, [isOpen, returnUrl]);
  
  const handleLogin = () => {
    console.log('AuthRequiredDialog: Login button clicked');
    setIsOpen(false);
    
    // Add returnUrl if provided
    const loginUrl = returnUrl 
      ? `/login?returnUrl=${encodeURIComponent(returnUrl)}`
      : '/login';
      
    console.log('Redirecting to:', loginUrl);
    router.push(loginUrl);
  };
  
  const handleCancel = () => {
    console.log('AuthRequiredDialog: Cancel button clicked');
    setIsOpen(false);
    router.push('/dashboard');
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
            <LockKeyhole className="h-6 w-6 text-blue-600" />
          </div>
          <AlertDialogTitle className="text-center">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center flex gap-2">
          <AlertDialogCancel onClick={handleCancel}>
            Go to Dashboard
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleLogin} className="bg-primary hover:bg-primary/90">
            Log In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 