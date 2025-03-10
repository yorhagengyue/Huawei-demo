'use client';

import { motion } from 'framer-motion';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface AnimatedButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  form?: string;
}

export default function AnimatedButton({ 
  children, 
  variant = 'primary', 
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  onClick,
  disabled,
  type = 'button',
  form,
}: AnimatedButtonProps) {
  
  // 定义不同变体的样式
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    outline: 'bg-transparent border border-primary text-primary hover:bg-primary/10',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  };
  
  // 定义不同尺寸的样式
  const sizeStyles = {
    sm: 'text-xs py-1.5 px-3',
    md: 'text-sm py-2 px-4',
    lg: 'text-base py-2.5 px-5'
  };
  
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={`
        rounded-md font-medium flex items-center justify-center gap-2
        transition-colors duration-200 ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      disabled={isLoading || disabled}
      onClick={onClick}
      type={type}
      form={form}
    >
      {isLoading ? (
        <span className="animate-spin mr-2">
          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      ) : icon ? (
        <span className="mr-1">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  );
} 