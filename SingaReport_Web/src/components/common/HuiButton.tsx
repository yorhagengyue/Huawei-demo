'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface RippleStyle {
  left: number;
  top: number;
  width: number;
  height: number;
  opacity: number;
}

interface HuiButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'tech';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  rounded?: boolean;
  className?: string;
  badge?: string | number;
  href?: string;
  target?: string;
  type?: 'button' | 'submit' | 'reset';
  animateScale?: boolean;
}

const HuiButton: React.FC<HuiButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  fullWidth = false,
  rounded = false,
  className = '',
  badge,
  href,
  target,
  type = 'button',
  animateScale = true,
}) => {
  const [ripples, setRipples] = useState<RippleStyle[]>([]);
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
  
  // 清除涟漪效果
  useEffect(() => {
    let timeoutIds: NodeJS.Timeout[] = [];
    
    ripples.forEach((_, index) => {
      const timeoutId = setTimeout(() => {
        setRipples(prevRipples => {
          const newRipples = [...prevRipples];
          if (newRipples[index]) {
            newRipples[index] = { ...newRipples[index], opacity: 0 };
          }
          return newRipples;
        });
        
        // 完全移除涟漪元素
        const removalId = setTimeout(() => {
          setRipples(prevRipples => prevRipples.filter((_, i) => i !== index));
        }, 400);
        
        timeoutIds.push(removalId);
      }, 600);
      
      timeoutIds.push(timeoutId);
    });
    
    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, [ripples]);
  
  // 处理按钮点击并创建涟漪效果
  const handleClick = (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (disabled) return;
    
    const button = buttonRef.current;
    if (!button) return;
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    
    // 计算点击位置
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // 添加新的涟漪效果
    const newRipple = {
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      opacity: 0.5,
    };
    
    setRipples(prevRipples => [...prevRipples, newRipple]);
    
    // 执行点击回调
    if (onClick) onClick();
  };
  
  // 确定按钮样式
  const getVariantClasses = (): string => {
    switch (variant) {
      case 'primary':
        return 'bg-primary text-white shadow-md hover:bg-primary/90 active:bg-primary/80';
      case 'secondary':
        return 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400';
      case 'outline':
        return 'bg-transparent border border-primary text-primary hover:bg-primary/10 active:bg-primary/20';
      case 'ghost':
        return 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200';
      case 'tech':
        return 'bg-transparent border border-[#42dcdb] text-[#42dcdb] neon-border hover:bg-[#42dcdb]/10 neon-text';
      default:
        return 'bg-primary text-white hover:bg-primary/90 active:bg-primary/80';
    }
  };
  
  const getSizeClasses = (): string => {
    switch (size) {
      case 'sm':
        return 'py-1.5 px-3 text-xs';
      case 'md':
        return 'py-2 px-4 text-sm';
      case 'lg':
        return 'py-2.5 px-5 text-base';
      case 'icon':
        return 'p-2';
      default:
        return 'py-2 px-4 text-sm';
    }
  };
  
  const getIconSizeClasses = (): string => {
    switch (size) {
      case 'sm': return 'w-3.5 h-3.5';
      case 'md': return 'w-4 h-4';
      case 'lg': return 'w-5 h-5';
      case 'icon': return 'w-5 h-5';
      default: return 'w-4 h-4';
    }
  };
  
  const baseClasses = `
    relative
    inline-flex
    items-center
    justify-center
    font-medium
    transition-all
    duration-200
    hui-btn
    overflow-hidden
    ${fullWidth ? 'w-full' : ''}
    ${rounded ? 'rounded-full' : 'rounded-lg'}
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;
  
  const Component = href ? 'a' : 'button';
  
  const buttonProps = {
    ref: buttonRef as any,
    onClick: handleClick,
    className: baseClasses,
    disabled: Component === 'button' ? disabled : undefined,
    href: Component === 'a' ? href : undefined,
    target: Component === 'a' ? target : undefined,
    type: Component === 'button' ? type : undefined,
    rel: Component === 'a' && target === '_blank' ? 'noopener noreferrer' : undefined,
    style: { WebkitTapHighlightColor: 'transparent' }
  };
  
  return (
    <motion.div
      className="inline-block"
      whileHover={animateScale && !disabled ? { scale: 1.03 } : {}}
      whileTap={animateScale && !disabled ? { scale: 0.97 } : {}}
    >
      <Component {...buttonProps}>
        {/* 涟漪效果 */}
        {ripples.map((style, index) => (
          <span
            key={index}
            className="absolute rounded-full bg-white pointer-events-none transition-opacity duration-400"
            style={{
              left: style.left,
              top: style.top,
              width: style.width,
              height: style.height,
              opacity: style.opacity,
              transform: 'scale(0)',
              animation: 'ripple 0.6s linear',
            }}
          />
        ))}
        
        {/* 图标 */}
        {icon && (
          <span className={`${children ? 'mr-2' : ''} ${getIconSizeClasses()}`}>
            {icon}
          </span>
        )}
        
        {/* 按钮内容 */}
        {children}
        
        {/* 角标 */}
        {badge && (
          <span className="absolute -top-2 -right-2 min-w-5 h-5 flex items-center justify-center text-xs bg-red-500 text-white rounded-full px-1.5">
            {badge}
          </span>
        )}
      </Component>
    </motion.div>
  );
};

export default HuiButton;

// 添加涟漪动画到全局样式
const addRippleStyle = () => {
  if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes ripple {
        to {
          transform: scale(2);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(styleElement);
  }
};

// 在客户端上添加样式
if (typeof window !== 'undefined') {
  addRippleStyle();
} 