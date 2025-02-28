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
    // 确保立即检查一次认证状态
    checkAuth();
    
    // 如果用户未登录且加载完成，则重定向到登录页面
    if (!isLoading && !isAuthenticated) {
      router.replace(fallbackUrl);
    }
  }, [isAuthenticated, isLoading, router, fallbackUrl, checkAuth]);

  // 加载中状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 如果未认证，不渲染子组件
  if (!isAuthenticated) {
    return null;
  }

  // 用户已认证，渲染子组件
  return <>{children}</>;
} 