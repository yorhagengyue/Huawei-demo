'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginForm() {
  const router = useRouter();
  const { login, authError, isLoading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 监听AuthContext错误
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 清除之前的错误和成功消息
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);
    
    try {
      // 调用AuthContext的login方法
      const success = await login(formData.email, formData.password);
      
      if (success) {
        setSuccessMessage('登录成功！正在重定向到仪表板...');
        
        // 设置延迟以展示成功消息，并确保认证状态同步
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        setError('登录失败，请检查您的凭据');
      }
    } catch (err: any) {
      setError(err.message || '登录过程中发生错误');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 组合加载状态
  const isLoading = isSubmitting || authLoading;

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">登录到您的账户</h2>
      
      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
          {error}
        </div>
      )}
      
      {/* 成功提示 */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md">
          {successMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            电子邮箱
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            密码
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="您的密码"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              checked={formData.rememberMe}
              onChange={handleChange}
              disabled={isLoading}
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
              记住我
            </label>
          </div>
          
          <div className="text-sm">
            <a href="/forgot-password" className="font-medium text-primary hover:text-primary/80">
              忘记密码?
            </a>
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                正在登录...
              </div>
            ) : '登录'}
          </button>
        </div>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          还没有账户?{' '}
          <a href="/register" className="font-medium text-primary hover:text-primary/80">
            立即注册
          </a>
        </p>
      </div>
    </div>
  );
} 