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

// 创建一个默认的上下文值
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

// 创建上下文
const AuthContext = createContext<AuthContextType>(defaultContext);

// 定义AuthContext的提供者组件
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // 使用useRef来跟踪是否已经检查了身份验证
  const hasCheckedAuth = useRef(false);
  const authCheckInProgress = useRef(false);
  const lastAuthCheck = useRef<number>(0);
  const AUTH_CHECK_INTERVAL = 60000; // 60秒
  
  // 事件监听器用于跨标签页同步
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

  // 广播身份验证状态变化
  const broadcastAuthStateChange = (type: 'login' | 'logout') => {
    localStorage.setItem('auth_event', JSON.stringify({ type, timestamp: Date.now() }));
    
    // 同时使用自定义事件在同一个标签页中进行通信
    const event = new CustomEvent('auth_state_changed', { 
      detail: { type, timestamp: Date.now() }
    });
    document.dispatchEvent(event);
  };

  // 检查用户是否已认证的函数
  const checkAuth = useCallback(async (): Promise<boolean> => {
    // 如果正在进行检查，则返回
    if (authCheckInProgress.current) {
      return !!user;
    }
    
    // 检查上次验证时间，如果时间太短，则跳过
    const now = Date.now();
    if (now - lastAuthCheck.current < 1000 && hasCheckedAuth.current) {
      return !!user;
    }
    
    // 设置状态以表明正在进行检查
    authCheckInProgress.current = true;
    setIsLoading(true);

    try {
      // 调用验证API
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // 确保包含凭据（cookies）
        credentials: 'include',
        // 防止缓存
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      const data = await response.json();

      // 更新上次检查时间
      lastAuthCheck.current = Date.now();
      hasCheckedAuth.current = true;

      if (response.ok && data.user) {
        setUser(data.user);
        setAuthError(null);
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      setUser(null);
      setAuthError('Authentication check failed');
      return false;
    } finally {
      setIsLoading(false);
      authCheckInProgress.current = false;
    }
  }, [user]);

  // 登录功能
  const login = async (email: string, password: string): Promise<boolean> => {
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
        throw new Error(data.error || 'Login failed');
      }

      // 登录成功后多次验证以确保状态同步
      await checkAuth();
      
      // 广播登录事件
      broadcastAuthStateChange('login');
      
      // 延迟以确保cookie和状态更新
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 再次检查以确保状态一致
      const isAuthenticated = await checkAuth();
      return isAuthenticated;
    } catch (error: any) {
      setAuthError(error.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 注销功能
  const logout = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Logout failed');
      }

      // 清除用户状态
      setUser(null);
      
      // 广播注销事件
      broadcastAuthStateChange('logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 注册功能
  const register = async (userData: RegisterData): Promise<boolean> => {
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

      // 注册成功后自动登录
      return await login(userData.email, userData.password);
    } catch (error: any) {
      setAuthError(error.message || 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 组件挂载时设置事件监听器并检查身份验证状态
  useEffect(() => {
    // 设置事件监听器
    const cleanup = setupEventListeners();
    
    // 页面加载时检查身份验证
    if (!hasCheckedAuth.current) {
      checkAuth();
    }
    
    // 设置自定义事件监听器
    const handleAuthStateChanged = () => {
      if (!authCheckInProgress.current) {
        checkAuth();
      }
    };
    
    document.addEventListener('auth_state_changed', handleAuthStateChanged);
    
    // 设置定期检查
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

  // 提供上下文值
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

// 自定义钩子
export const useAuth = () => useContext(AuthContext);

// 用于监听认证状态变化的钩子函数
export const useAuthSync = () => {
  const [, setForceUpdate] = useState({});

  useEffect(() => {
    // 当认证状态改变时强制更新
    const handleAuthStateChange = () => {
      setForceUpdate({});
    };

    // 监听自定义认证状态变化事件
    document.addEventListener('auth_state_changed', handleAuthStateChange);
    
    // 监听localStorage变化
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