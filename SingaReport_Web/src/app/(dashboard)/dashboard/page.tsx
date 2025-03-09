'use client';

import { Suspense } from 'react';
import DashboardClient from './DashboardClient';

export default function DashboardPage() {
  return (
    <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      }>
        <DashboardClient />
      </Suspense>
    </main>
  );
} 