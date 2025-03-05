'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface StepTransitionProps {
  children: ReactNode;
  step: number;
  direction: 'forward' | 'backward';
}

export default function StepTransition({ 
  children, 
  step,
  direction = 'forward' 
}: StepTransitionProps) {
  // 根据方向定义动画参数
  const xOffset = direction === 'forward' ? 50 : -50;
  
  // 滑动和淡入淡出组合的动画变体
  const variants = {
    enter: {
      x: xOffset,
      opacity: 0,
    },
    center: {
      x: 0,
      opacity: 1,
    },
    exit: {
      x: -xOffset,
      opacity: 0,
    },
  };

  return (
    <div className="w-full overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 