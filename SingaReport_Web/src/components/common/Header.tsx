'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useAuth, useAuthSync } from '@/contexts/AuthContext';
import ConfirmDialog from './ConfirmDialog';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, isLoading, logout, checkAuth } = useAuth();
  
  // Force re-render when auth state changes
  useAuthSync();
  
  // Track component mounting state with refs
  const isMounted = useRef(false);
  const initialLoadComplete = useRef(false);
  const authCheckPerformed = useRef(false);
  
  // Handle initial auth check once on mount
  useEffect(() => {
    // Mark as mounted immediately
    isMounted.current = true;
    
    // Only perform auth check once
    const performInitialAuthCheck = async () => {
      if (!authCheckPerformed.current) {
        console.log('📋 Header: Performing initial auth check');
        await checkAuth();
        authCheckPerformed.current = true;
        
        // Short delay to ensure state is applied before marking complete
        setTimeout(() => {
          initialLoadComplete.current = true;
        }, 50);
      }
    };
    
    performInitialAuthCheck();
    
    // Set up event listener for auth changes
    const handleAuthChange = () => {
      console.log('🔄 Header detected auth change');
    };
    
    document.addEventListener('auth_state_change', handleAuthChange);
    
    return () => {
      document.removeEventListener('auth_state_change', handleAuthChange);
    };
  }, [checkAuth]);
  
  // Logout handler
  const handleLogout = async () => {
    // Show confirmation dialog
    setShowLogoutConfirm(true);
  };
  
  const confirmLogout = async () => {
    // Close all open menus
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    setShowLogoutConfirm(false);
    
    console.log('🚪 Header: Initiating logout');
    await logout();
    
    // Force refresh the page - only after successful logout
    window.location.href = '/';
  };
  
  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Server-side rendering placeholder
  if (!isMounted.current) {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary">SingaReport</span>
            </div>
            <div className="h-10 w-40 bg-gray-100 animate-pulse rounded-md"></div>
          </div>
        </div>
      </header>
    );
  }

  // Loading state - during initial auth check
  if (isLoading && !initialLoadComplete.current) {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary">SingaReport</span>
            </Link>
            <div className="h-10 w-40 bg-gray-100 animate-pulse rounded-md"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">SingaReport</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/map" className="text-gray-600 hover:text-primary">
              Map Overview
            </Link>
            <Link href="/report/new" className="text-gray-600 hover:text-primary">
              Report Issue
            </Link>
            {user && (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-primary">
                  My Reports
                </Link>
                <Link href="/files" className="text-gray-600 hover:text-primary">
                  File Manager
                </Link>
              </>
            )}
            <Link href="/help" className="text-gray-600 hover:text-primary">
              Help Center
            </Link>
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <button 
                className="flex items-center text-gray-600 hover:text-primary"
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              >
                <span className="mr-1">English</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      English
                    </button>
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Chinese
                    </button>
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Bahasa Melayu
                    </button>
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      தமிழ் (Tamil)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Show login/register buttons or user info */}
            {isLoading ? (
              <div className="animate-pulse h-10 w-20 bg-gray-200 rounded-md"></div>
            ) : user ? (
              <div className="relative">
                <button 
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{user.name || user.username}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <Link 
                        href="/dashboard" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link 
                        href="/files" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        File Manager
                      </Link>
                      <Link 
                        href="/account-settings" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Account Settings
                      </Link>
                      <button 
                        onClick={handleLogout} 
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-primary border border-primary px-4 py-2 rounded-md hover:bg-primary/5 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100">
            <nav className="flex flex-col space-y-3 pb-3">
              <Link 
                href="/map" 
                className="text-gray-600 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Map Overview
              </Link>
              <Link 
                href="/report/new" 
                className="text-gray-600 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Report Issue
              </Link>
              {user && (
                <>
                  <Link 
                    href="/dashboard" 
                    className="text-gray-600 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Reports
                  </Link>
                  <Link 
                    href="/files" 
                    className="text-gray-600 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    File Manager
                  </Link>
                </>
              )}
              <Link 
                href="/help" 
                className="text-gray-600 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Help Center
              </Link>
            </nav>
            
            {/* Mobile Language Selector */}
            <div className="py-3 border-t border-gray-100">
              <div className="font-medium text-gray-500 mb-2">Language</div>
              <div className="grid grid-cols-2 gap-2">
                <button className="text-left px-2 py-1 text-sm rounded-md text-gray-700 bg-gray-100">
                  English
                </button>
                <button className="text-left px-2 py-1 text-sm rounded-md text-gray-700 hover:bg-gray-100">
                  Chinese
                </button>
                <button className="text-left px-2 py-1 text-sm rounded-md text-gray-700 hover:bg-gray-100">
                  Bahasa Melayu
                </button>
                <button className="text-left px-2 py-1 text-sm rounded-md text-gray-700 hover:bg-gray-100">
                  தமிழ் (Tamil)
                </button>
              </div>
            </div>
            
            {/* Mobile User Section */}
            <div className="pt-3 border-t border-gray-100">
              {isLoading ? (
                <div className="animate-pulse h-10 bg-gray-200 rounded-md"></div>
              ) : user ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white">
                      {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{user.name || user.username}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link 
                      href="/dashboard" 
                      className="text-center px-4 py-2 text-sm rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/account-settings" 
                      className="text-center px-4 py-2 text-sm rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Account
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    <Link 
                      href="/files" 
                      className="text-center px-4 py-2 text-sm rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      File Manager
                    </Link>
                  </div>
                  <button 
                    onClick={handleLogout} 
                    className="w-full mt-2 py-2 px-4 rounded-md text-sm text-white bg-red-500 hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link 
                    href="/login" 
                    className="text-center text-primary border border-primary px-4 py-2 rounded-md hover:bg-primary/5 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register" 
                    className="text-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to log out? You will need to sign in again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
        type="warning"
      />
    </header>
  );
} 