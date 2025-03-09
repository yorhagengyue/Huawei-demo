'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { parseJwt } from '@/lib/auth/jwt-utils';
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
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

  // Authentication check function
  const checkAuth = useCallback(async (): Promise<boolean> => {
    // Skip auth check on server-side
    if (typeof window === 'undefined' || !isClient) {
      return false;
    }
    
    const now = Date.now();
    
    // Prevent multiple simultaneous checks
    if (authCheckInProgress.current) {
      return !!user;
    }
    
    // Only check once every second at most
    if (now - lastAuthCheck.current < 1000 && user) {
      return true;
    }
    
    authCheckInProgress.current = true;
    setIsLoading(true);
    lastAuthCheck.current = now;
    
    try {
      // Check for token in localStorage
      const token = localStorage.getItem('auth_token');
      
      // If no token, user is not authenticated
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        hasCheckedAuth.current = true;
        return false;
      }
      
      // Try to parse the token to check validity
      try {
        const parsedToken = parseJwt(token);
        if (parsedToken && parsedToken.exp) {
          const now = Math.floor(Date.now() / 1000);
          if (parsedToken.exp < now) {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('auth_token');
            return false;
          }
        }
      } catch (parseError) {
        console.error('Error parsing token:', parseError);
      }
      
      // Verify token with server
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        credentials: 'include',
      });
      
      // If verification succeeded
      if (response.ok) {
        const data = await response.json();
        
        // Update user data and authentication state
        setUser(data.user);
        setIsAuthenticated(true);
        setAuthError(null);
        
        // Update localStorage with latest token if provided
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
        
        hasCheckedAuth.current = true;
        return true;
      } else {
        // If server rejected token, clear auth state
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('auth_token');
        hasCheckedAuth.current = true;
        return false;
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setAuthError(null);
      return !!user;
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Authentication failed. Please check your credentials.');
      }

      // Extract token from response
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      // Set user data immediately
      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      }

      // Broadcast login event
      broadcastAuthStateChange('login');
      
      return true;
    } catch (error: any) {
      console.error('Login failed:', error);
      setAuthError(error.message || 'Authentication failed. Please try again.');
      setIsAuthenticated(false);
      setUser(null);
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
    // If not on client side, return immediately
    if (typeof window === 'undefined' || !isClient) {
      console.error('Cannot perform registration on server side');
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

      // If auto-login after registration, set token and user data
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
    isAuthenticated,
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