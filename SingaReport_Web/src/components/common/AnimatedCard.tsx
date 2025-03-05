'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export default function AnimatedCard({ 
  children, 
  delay = 0, 
  className = '' 
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: delay
      }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
} 