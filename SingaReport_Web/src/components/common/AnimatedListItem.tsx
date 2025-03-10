'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedListItemProps {
  children: ReactNode;
  index: number;
  onClick?: () => void;
  className?: string;
  staggerDelay?: number; // 用于控制列表项之间的延迟
}

export default function AnimatedListItem({
  children,
  index,
  onClick,
  className = '',
  staggerDelay = 0.05
}: AnimatedListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: index * staggerDelay, // 基于索引的错开动画
      }}
      whileHover={{
        scale: 1.01,
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`rounded-lg p-4 transition-colors duration-200 ${className} ${onClick ? 'cursor-pointer' : ''}`}
      layout // 启用布局转换动画
    >
      {children}
    </motion.div>
  );
}

// 创建一个容器来配合列表项使用
export function AnimatedList({ 
  children, 
  className = '' 
}: { 
  children: ReactNode,
  className?: string
}) {
  return (
    <motion.div
      className={`space-y-3 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
} 