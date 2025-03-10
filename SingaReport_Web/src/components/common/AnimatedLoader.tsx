'use client';

import { motion } from 'framer-motion';

interface AnimatedLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'white' | 'dark';
  text?: string;
  centered?: boolean;
}

export default function AnimatedLoader({
  size = 'md',
  variant = 'primary',
  text,
  centered = false
}: AnimatedLoaderProps) {
  // 定义尺寸样式
  const sizeMap = {
    sm: { dot: 'w-1 h-1', container: 'gap-1', text: 'text-xs' },
    md: { dot: 'w-2 h-2', container: 'gap-1.5', text: 'text-sm' },
    lg: { dot: 'w-3 h-3', container: 'gap-2', text: 'text-base' }
  };

  // 定义颜色样式
  const colorMap = {
    primary: 'bg-primary',
    white: 'bg-white',
    dark: 'bg-gray-800'
  };

  // 动画变体
  const bounceTransition = {
    y: {
      duration: 0.4,
      yoyo: Infinity,
      ease: "easeOut"
    }
  };

  // 容器样式
  const containerClass = centered 
    ? 'flex flex-col items-center justify-center w-full' 
    : 'flex flex-col items-center';

  return (
    <div className={containerClass}>
      <div className={`flex ${sizeMap[size].container}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`rounded-full ${sizeMap[size].dot} ${colorMap[variant]}`}
            transition={{
              ...bounceTransition,
              delay: i * 0.1
            }}
            animate={{
              y: ["0%", "-50%", "0%"]
            }}
          />
        ))}
      </div>
      
      {text && (
        <motion.p 
          className={`mt-2 ${sizeMap[size].text} text-gray-600`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
} 