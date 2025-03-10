'use client';

import React, { useEffect, useState } from 'react';
import DataVizSphere from '@/components/common/DataVizSphere';
import { fetchReportDataPoints } from '@/services/ReportDataService';
import { DataPoint } from '@/types/map-types';

interface ReportDataSphereProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

/**
 * 包装组件，负责从API获取实时报告数据，并将其传递给DataVizSphere组件
 */
const ReportDataSphere: React.FC<ReportDataSphereProps> = ({
  width,
  height = 400,
  className = ''
}) => {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchReportDataPoints();
        setDataPoints(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load report data:', err);
        setError('Failed to load visualization data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // 每5分钟刷新一次数据
    const intervalId = setInterval(loadData, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // 数据加载中显示简单的加载状态
  if (isLoading && dataPoints.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: typeof height === 'number' ? `${height}px` : height }}>
        <div className="text-center">
          <div className="animate-pulse text-blue-500">
            <svg className="w-10 h-10 animate-spin mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="mt-3 text-gray-600">Loading data visualization...</p>
          <p className="text-xs text-gray-500 mt-1">This may take a moment while we connect to the database</p>
        </div>
      </div>
    );
  }

  // 错误显示
  if (error && dataPoints.length === 0) {
    return (
      <div className="flex items-center justify-center text-red-500" style={{ height: typeof height === 'number' ? `${height}px` : height }}>
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-lg font-medium mb-2">{error}</p>
          <p className="text-sm text-gray-600 mb-4">The database connection may be experiencing issues. Please check if the database service is running.</p>
          <button 
            onClick={() => {
              setIsLoading(true);
              setError(null);
              fetchReportDataPoints()
                .then(data => {
                  setDataPoints(data);
                  setIsLoading(false);
                })
                .catch(e => {
                  console.error(e);
                  setError('Unable to load data. Please try again later.');
                  setIsLoading(false);
                });
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry Connection
            </div>
          </button>
        </div>
      </div>
    );
  }

  // 没有数据时显示提示
  if (!isLoading && dataPoints.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-500" style={{ height: typeof height === 'number' ? `${height}px` : height }}>
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-lg font-medium mb-2">No Report Data Available</p>
          <p className="text-sm text-gray-500">No reports with geographic coordinates were found in the database. Please add some reports first.</p>
        </div>
      </div>
    );
  }

  // 数据已加载，显示可视化组件
  return (
    <DataVizSphere
      width={width}
      height={height}
      dataPoints={dataPoints}
      isLoading={isLoading}
      className={className}
    />
  );
};

export default ReportDataSphere; 