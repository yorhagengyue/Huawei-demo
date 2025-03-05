'use client';

import { motion } from 'framer-motion';

interface AnimatedTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function AnimatedTitle({ 
  title, 
  subtitle, 
  className = '' 
}: AnimatedTitleProps) {
  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: 'easeOut'
      } 
    }
  };
  
  const subtitleVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        delay: 0.2,
        duration: 0.5
      } 
    }
  };
  
  return (
    <div className={`mb-6 ${className}`}>
      <motion.h1
        className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
        initial="hidden"
        animate="visible"
        variants={titleVariants}
      >
        {title}
      </motion.h1>
      
      {subtitle && (
        <motion.p
          className="text-gray-600"
          initial="hidden"
          animate="visible"
          variants={subtitleVariants}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
} 