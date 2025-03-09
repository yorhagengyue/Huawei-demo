'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PublicReportRedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    // 重定向到新的报告创建路径
    router.replace('/report/create');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-2"></div>
        <p className="text-gray-600">正在重定向到新的报告页面...</p>
      </div>
    </div>
  );
} 