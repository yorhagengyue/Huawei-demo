'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function WelcomePrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const { user, isLoading } = useAuth();
  const [hasVisitedBefore, setHasVisitedBefore] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Check if the user has visited the site before
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    setHasVisitedBefore(!!hasVisited);

    // Show the prompt if user is not logged in and it's their first visit
    if (!isLoading && !user && !hasVisited) {
      // Slight delay for better UX - shows after content loads
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [user, isLoading]);

  // Handle prompt dismissal with storage update
  const dismissPrompt = () => {
    setIsVisible(false);
    localStorage.setItem('hasVisitedBefore', 'true');
  };

  if (!isMounted || !isVisible || isLoading || user) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-40 z-30 animate-fade-in"
        onClick={dismissPrompt}
      />
      
      {/* Welcome Prompt Card */}
      <div className="fixed bottom-10 left-0 right-0 mx-auto max-w-2xl bg-white shadow-xl border border-gray-200 rounded-lg z-40 p-6 animate-slide-up">
        <div className="flex flex-col">
          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold text-primary mb-2">Welcome to SingaReport!</h3>
            <p className="text-gray-600">
              Join our community platform for reporting and tracking urban issues in Singapore.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-lg mb-2">Why Register?</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Submit and track your own reports
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Receive status updates and notifications
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Participate in community discussions
                </li>
              </ul>
            </div>
            
            <div className="bg-primary/5 p-4 rounded-lg">
              <h4 className="font-semibold text-lg mb-2">Getting Started</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-primary mr-2">1.</span>
                  Create a free account
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">2.</span>
                  Verify your email address
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">3.</span>
                  Start reporting issues in your area
                </li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors text-center font-medium"
            >
              Register Now
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto text-primary border border-primary px-6 py-3 rounded-md hover:bg-primary/5 transition-colors text-center font-medium"
            >
              Login
            </Link>
            <button 
              onClick={dismissPrompt}
              className="w-full sm:w-auto text-gray-500 mt-2 sm:mt-0"
            >
              Explore First
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 