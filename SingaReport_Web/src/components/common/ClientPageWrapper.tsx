'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import PageTransition from './PageTransition';

interface ClientPageWrapperProps {
  children: ReactNode;
}

export default function ClientPageWrapper({ children }: ClientPageWrapperProps) {
  const pathname = usePathname();
  
  // 这些页面已有自己的动画，不需要应用页面过渡动画
  const pagesWithOwnAnimations = [
    '/report/success',
    '/report/create',
  ];
  
  // 页面路由变化时立即滚动到顶部
  useEffect(() => {
    // 立即执行
    window.scrollTo(0, 0);
    
    // 还可以延迟执行一次，确保在DOM更新后滚动
    const timeoutId = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [pathname]);
  
  const shouldAnimatePage = !pagesWithOwnAnimations.some(path => pathname?.includes(path));
  
  return (
    <PageTransition shouldAnimate={shouldAnimatePage}>
      {children}
    </PageTransition>
  );
} 