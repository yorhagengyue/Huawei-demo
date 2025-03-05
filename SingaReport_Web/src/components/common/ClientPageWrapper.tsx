'use client';

import { ReactNode } from 'react';
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
    '/report/new',
  ];
  
  const shouldAnimatePage = !pagesWithOwnAnimations.some(path => pathname?.includes(path));
  
  return (
    <PageTransition shouldAnimate={shouldAnimatePage}>
      {children}
    </PageTransition>
  );
} 