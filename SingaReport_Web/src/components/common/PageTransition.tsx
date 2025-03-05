'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  transitionType?: 'fade' | 'slide' | 'scale' | 'fadeSlide';
  shouldAnimate?: boolean;
}

export default function PageTransition({ 
  children,
  transitionType = 'fadeSlide',
  shouldAnimate = true
}: PageTransitionProps) {
  const pathname = usePathname();
  
  // 如果不需要动画，直接返回内容
  if (!shouldAnimate) {
    return <>{children}</>;
  }
  
  // 定义不同类型的动画变体
  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3 }
    },
    slide: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '-100%' },
      transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] }
    },
    scale: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.1 },
      transition: { duration: 0.3 }
    },
    fadeSlide: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  };
  
  // 选择当前使用的动画类型
  const currentVariant = variants[transitionType];
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={currentVariant.initial}
        animate={currentVariant.animate}
        exit={currentVariant.exit}
        transition={currentVariant.transition}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
} 