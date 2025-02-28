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
  
  // Use useRef to track if authentication has been checked
  const hasCheckedAuth = useRef(false);
  const authCheckInProgress = useRef(false);
  const lastAuthCheck = useRef<number>(0);
  const AUTH_CHECK_INTERVAL = 60000; // 60 seconds
  
  // Event listeners for cross-tab synchronization
  const setupEventListeners = useCallback(() => {
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
    localStorage.setItem('auth_event', JSON.stringify({ type, timestamp: Date.now() }));
    
    // Also use custom events for communication within the same tab
    const event = new CustomEvent('auth_state_changed', { 
      detail: { type, timestamp: Date.now() }
    });
    document.dispatchEvent(event);
  };

  // Function to check if user is authenticated
  const checkAuth = useCallback(async (): Promise<boolean> => {
    // If check is in progress, return
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
      // 获取localStorage中的令牌
      const token = localStorage.getItem('auth_token');
      
      // 准备请求头
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      };
      
      // 如果有令牌,添加到请求头
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Call verification API
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include',
        // Prevent caching
        cache: 'no-store',
        headers
      });

      const data = await response.json();

      // Update last check time
      lastAuthCheck.current = Date.now();
      hasCheckedAuth.current = true;

      if (response.ok && data.user) {
        setUser(data.user);
        setAuthError(null);
        return true;
      } else {
        setUser(null);
        // 如果验证失败,清除本地令牌
        localStorage.removeItem('auth_token');
        return false;
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      setUser(null);
      setAuthError('Authentication check failed');
      // 发生错误时清除本地令牌
      localStorage.removeItem('auth_token');
      return false;
    } finally {
      setIsLoading(false);
      authCheckInProgress.current = false;
    }
  }, [user]);

  // Login functionality
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);

    try {
      // 添加调试日志
      console.log('尝试登录:', email);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();
      
      // 添加调试日志
      console.log('登录响应状态:', response.status, response.ok);

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // 保存令牌到localStorage以便API调用
      if (data.token) {
        console.log('保存令牌到localStorage');
        localStorage.setItem('auth_token', data.token);
      } else {
        console.warn('登录响应中没有令牌');
      }

      // 手动设置用户数据以防止必须等待checkAuth
      if (data.user) {
        setUser(data.user);
      }

      // Verify multiple times after login to ensure state synchronization
      await checkAuth();
      
      // Broadcast login event
      broadcastAuthStateChange('login');
      
      // Delay to ensure cookie and state updates
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Check again to ensure state consistency
      const isAuthenticated = await checkAuth();
      return isAuthenticated;
    } catch (error: any) {
      console.error('登录失败:', error);
      setAuthError(error.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout functionality
  const logout = async (): Promise<void> => {
    setIsLoading(true);

    try {
      // 先在客户端清除状态
      setUser(null);
      localStorage.removeItem('auth_token');
      
      // 然后调用服务器注销API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Logout failed');
      }
      
      // Broadcast logout event
      broadcastAuthStateChange('logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Register functionality
  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);

    try {
      // 添加调试日志
      console.log('尝试注册用户:', userData.username);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      });

      const data = await response.json();
      
      // 添加调试日志
      console.log('注册响应状态:', response.status, response.ok);

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // 保存令牌到localStorage以便API调用
      if (data.token) {
        console.log('保存注册令牌到localStorage');
        localStorage.setItem('auth_token', data.token);
      } else {
        console.warn('注册响应中没有令牌');
      }

      // Register successfully, set user without login again
      if (data.user) {
        setUser(data.user);
        broadcastAuthStateChange('login');
        return true;
      }

      // 如果没有返回用户数据,通过登录获取
      return await login(userData.email, userData.password);
    } catch (error: any) {
      setAuthError(error.message || 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Component mount, set event listeners, and check authentication status
  useEffect(() => {
    // Set event listeners
    const cleanup = setupEventListeners();
    
    // Check authentication status when page loads
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
  }, [checkAuth, setupEventListeners]);

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

// Custom hook function to listen for authentication status changes
export const useAuthSync = () => {
  const [, setForceUpdate] = useState({});

  useEffect(() => {
    // Force update when authentication status changes
    const handleAuthStateChange = () => {
      setForceUpdate({});
    };

    // Listen for custom authentication status change events
    document.addEventListener('auth_state_changed', handleAuthStateChange);
    
    // Listen for localStorage changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'auth_event') {
        setForceUpdate({});
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      document.removeEventListener('auth_state_changed', handleAuthStateChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
};

export default AuthContext; 