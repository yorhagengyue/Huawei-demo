'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface AnimatedNotificationProps {
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // 持续时间（毫秒），0表示不自动关闭
  onClose?: () => void;
  action?: ReactNode; // 可选的操作按钮
  isVisible: boolean;
}

export default function AnimatedNotification({
  type,
  title,
  message,
  duration = 5000, // 默认5秒后自动关闭
  onClose,
  action,
  isVisible
}: AnimatedNotificationProps) {
  const [shouldRender, setShouldRender] = useState(isVisible);
  
  // 自动关闭逻辑
  useEffect(() => {
    // 当变为可见时，设置渲染状态
    if (isVisible) {
      setShouldRender(true);
    }
    
    // 如果设置了持续时间，则在指定时间后关闭
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);
  
  // 动画完成后处理不可见的状态
  const handleAnimationComplete = () => {
    if (!isVisible) {
      setShouldRender(false);
    }
  };
  
  // 根据类型获取图标和样式
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-500'
        };
      case 'error':
        return {
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-500'
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-blue-500" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-500'
        };
    }
  };
  
  const { icon, bgColor, borderColor } = getTypeStyles();
  
  return (
    <AnimatePresence onExitComplete={handleAnimationComplete}>
      {shouldRender && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-4 right-4 z-50 max-w-md ${bgColor} border-l-4 ${borderColor} rounded-md shadow-lg`}
        >
          <div className="flex p-4">
            <div className="flex-shrink-0 mr-3">
              {icon}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">{title}</h3>
              {message && (
                <div className="mt-1 text-sm text-gray-600">
                  {message}
                </div>
              )}
              {action && (
                <div className="mt-3">
                  {action}
                </div>
              )}
            </div>
            <button 
              onClick={onClose} 
              className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 通知管理组件（用于管理多个通知）
export function NotificationProvider({ 
  children 
}: { 
  children: ReactNode 
}) {
  // 这里可以实现一个通知管理系统，如果需要的话
  return (
    <>
      {children}
    </>
  );
} 