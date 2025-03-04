'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { parseJwt } from '@/lib/utils/jwt-parser';
import { User } from '@/types/user';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<boolean>;
  checkAuth: () => Promise<boolean>;
};

type RegisterData = {
  username: string;
  email: string;
  password: string;
  name?: string;
};

// Create a default context value
const defaultContext: AuthContextType = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  authError: null,
  login: async () => false,
  logout: async () => {},
  register: async () => false,
  checkAuth: async () => false,
};

// Create context
const AuthContext = createContext<AuthContextType>(defaultContext);

// Define AuthContext provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Use useRef to track if authentication has been checked
  const hasCheckedAuth = useRef(false);
  const authCheckInProgress = useRef(false);
  const lastAuthCheck = useRef<number>(0);
  const AUTH_CHECK_INTERVAL = 60000; // 60 seconds
  
  // 设置客户端标志
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Event listeners for cross-tab synchronization
  const setupEventListeners = useCallback(() => {
    if (typeof window === 'undefined') return () => {};
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'auth_event') {
        const authEvent = JSON.parse(event.newValue || '{}');
        if (authEvent.type === 'logout') {
          setUser(null);
        } else if (authEvent.type === 'login') {
          checkAuth();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Broadcast authentication state changes
  const broadcastAuthStateChange = (type: 'login' | 'logout') => {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('auth_event', JSON.stringify({ type, timestamp: Date.now() }));
    
    // Also use custom events for communication within the same tab
    const event = new CustomEvent('auth_state_changed', { 
      detail: { type, timestamp: Date.now() }
    });
    document.dispatchEvent(event);
  };

  // Function to check if user is authenticated
  const checkAuth = useCallback(async (): Promise<boolean> => {
    // If not in client environment, return false
    if (typeof window === 'undefined' || !isClient) {
      return false;
    }
    
    // If check is already in progress, return current user state
    if (authCheckInProgress.current) {
      return !!user;
    }
    
    // Check last verification time, if too recent, skip
    const now = Date.now();
    if (now - lastAuthCheck.current < 1000 && hasCheckedAuth.current) {
      return !!user;
    }
    
    // Set state to indicate check is in progress
    authCheckInProgress.current = true;
    setIsLoading(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('auth_token');
      
      // If no token in localStorage, try to get from cookies (if cookies are accessible)
      let effectiveToken = token;
      if (!effectiveToken) {
        try {
          const cookies = document.cookie.split(';');
          const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
          if (authCookie) {
            effectiveToken = authCookie.split('=')[1];
            console.log('Token found in cookies');
          }
        } catch (e) {
          console.warn('Failed to get token from cookies:', e);
        }
      }
      
      // If no token found, return unauthenticated
      if (!effectiveToken) {
        console.log('Authentication token not found');
        setUser(null);
        return false;
      }
      
      // Prepare request headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      };
      
      // Add token to Authorization header if available
      if (effectiveToken) {
        headers['Authorization'] = `Bearer ${effectiveToken}`;
      }
      
      // Call verification API
      console.log('Sending verification request...');
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include',
        // Prevent caching
        cache: 'no-store',
        headers
      });

      const data = await response.json();
      console.log('Verification response:', response.status, data);

      // Update last check time
      lastAuthCheck.current = Date.now();
      hasCheckedAuth.current = true;

      if (response.ok && data.user) {
        // If response includes token, update localStorage
        if (data.token) {
          console.log('Updating token from verification response');
          localStorage.setItem('auth_token', data.token);
        }
        
        setUser(data.user);
        setAuthError(null);
        return true;
      } else {
        console.log('Verification failed, clearing user state');
        setUser(null);
        // If verification fails, clear local token
        localStorage.removeItem('auth_token');
        return false;
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      setUser(null);
      setAuthError('Authentication check failed');
      // Clear local token on error
      localStorage.removeItem('auth_token');
      return false;
    } finally {
      setIsLoading(false);
      authCheckInProgress.current = false;
    }
  }, [user, isClient]);

  // Login functionality
  const login = async (email: string, password: string): Promise<boolean> => {
    // Check if we're in client environment
    if (typeof window === 'undefined' || !isClient) {
      console.error('Cannot perform login on server side');
      return false;
    }
    
    setIsLoading(true);
    setAuthError(null);

    try {
      // Add debug log
      console.log('Attempting login with email:', email);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();
      
      // Detailed debug logs
      console.log('Login response status:', response.status, response.ok);
      console.log('Login response data:', JSON.stringify(data));

      if (!response.ok) {
        console.error('Login request failed:', data.error || 'Unknown error');
        throw new Error(data.error || 'Login failed');
      }

      // Extract token from response
      if (data.token) {
        console.log('Token found in response body');
        localStorage.setItem('auth_token', data.token);
      } else {
        console.log('No token in response, trying to get from cookies');
        // Try to get token from cookies (if our API sets non-HttpOnly cookies)
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
        
        if (authCookie) {
          const token = authCookie.split('=')[1];
          localStorage.setItem('auth_token', token);
          console.log('Token retrieved from cookies');
        } else {
          console.warn('Login successful but could not retrieve token, possibly using HttpOnly cookies');
        }
      }

      // Set user data immediately to prevent having to wait for checkAuth
      if (data.user) {
        console.log('Setting user data:', data.user);
        setUser(data.user);
      }

      // Verify authentication status after login
      console.log('Checking authentication after login');
      await checkAuth();
      
      // Broadcast login event
      broadcastAuthStateChange('login');
      
      // Small delay to ensure cookie and state updates
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Check again to ensure authentication state consistency
      const isAuthenticated = await checkAuth();
      console.log('Final authentication status:', isAuthenticated);
      
      if (!isAuthenticated) {
        console.error('Login appeared successful but auth check failed');
        throw new Error('Authentication verification failed. Please try again.');
      }
      
      return isAuthenticated;
    } catch (error: any) {
      console.error('Login failed:', error);
      setAuthError(error.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout functionality
  const logout = async (): Promise<void> => {
    // Check if running in client-side environment
    if (typeof window === 'undefined' || !isClient) {
      console.error('Cannot execute logout on server-side');
      return;
    }
    
    // Set loading state before making request
    setIsLoading(true);
    
    try {
      // Call logout API to clear cookies
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.error(`Logout API error: ${response.status} ${response.statusText}`);
      }

      // Clear local state
      setUser(null);
      setAuthError(null);
      
      // Clear local storage
      localStorage.removeItem('auth_token');
      
      // Broadcast logout event to other tabs
      broadcastAuthStateChange('logout');
      
      console.log('Logout completed successfully');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Check if component is still mounted before updating state
      if (isClient) {
        setIsLoading(false);
      }
    }
  };

  // Register functionality
  const register = async (userData: RegisterData): Promise<boolean> => {
    // 如果不在客户端，直接返回
    if (typeof window === 'undefined' || !isClient) {
      console.error('无法在服务器端执行注册');
      return false;
    }
    
    setIsLoading(true);
    setAuthError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // 如果注册后自动登录,设置令牌和用户数据
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      if (data.user) {
        setUser(data.user);
        broadcastAuthStateChange('login');
      }

      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      setAuthError(error.message || 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize authentication check and event listeners
  useEffect(() => {
    if (!isClient) return;
    
    // Set up event listeners for cross-tab auth state sync
    const cleanup = setupEventListeners();
    
    // Only check auth if we haven't checked yet
    if (!hasCheckedAuth.current) {
      checkAuth();
    }
    
    // Set custom event listeners
    const handleAuthStateChanged = () => {
      if (!authCheckInProgress.current) {
        checkAuth();
      }
    };
    
    document.addEventListener('auth_state_changed', handleAuthStateChanged);
    
    // Set periodic checks
    const intervalId = setInterval(() => {
      const now = Date.now();
      if (now - lastAuthCheck.current > AUTH_CHECK_INTERVAL) {
        checkAuth();
      }
    }, AUTH_CHECK_INTERVAL);
    
    return () => {
      cleanup();
      document.removeEventListener('auth_state_changed', handleAuthStateChanged);
      clearInterval(intervalId);
    };
  }, [checkAuth, setupEventListeners, isClient]);

  // Provide context value
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    authError,
    login,
    logout,
    register,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);

// Hook for syncing authentication state in components based on local storage changes
export const useAuthSync = () => {
  const { checkAuth } = useAuth();
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleAuthStateChange = () => {
      checkAuth();
    };
    
    // Add event listeners
    document.addEventListener('auth_state_changed', handleAuthStateChange);
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'auth_token' || event.key === 'auth_event') {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      document.removeEventListener('auth_state_changed', handleAuthStateChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkAuth]);
};

export default AuthContext; 