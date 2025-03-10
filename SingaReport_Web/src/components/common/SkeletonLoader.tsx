'use client';

import { memo } from 'react';

interface SkeletonProps {
  className?: string;
  height?: string | number;
  width?: string | number;
  rounded?: boolean | string;
  circle?: boolean;
  count?: number;
}

const Skeleton = memo(({
  className = '',
  height = 'auto',
  width = '100%',
  rounded = 'md',
  circle = false,
  count = 1,
}: SkeletonProps) => {
  // 处理圆角值
  const getBorderRadius = () => {
    if (circle) return '50%';
    if (typeof rounded === 'boolean') return rounded ? '0.375rem' : '0';
    switch (rounded) {
      case 'none': return '0';
      case 'sm': return '0.125rem';
      case 'md': return '0.375rem';
      case 'lg': return '0.5rem';
      case 'xl': return '0.75rem';
      case '2xl': return '1rem';
      case 'full': return '9999px';
      default: return rounded;
    }
  };
  
  // 处理高度和宽度
  const getHeight = () => typeof height === 'number' ? `${height}px` : height;
  const getWidth = () => typeof width === 'number' ? `${width}px` : width;
  
  // 计算基础样式
  const baseStyle = {
    height: getHeight(),
    width: getWidth(),
    borderRadius: getBorderRadius(),
  };
  
  // 生成多个骨架元素
  const renderSkeletons = () => {
    return Array(count).fill(0).map((_, index) => (
      <div
        key={index}
        style={baseStyle}
        className={`skeleton bg-gray-200 ${className}`}
        aria-hidden="true"
      />
    ));
  };
  
  return <>{renderSkeletons()}</>;
});

Skeleton.displayName = 'Skeleton';

export default Skeleton;

interface SkeletonCardProps {
  imageHeight?: string | number;
  titleWidth?: string | number;
  lines?: number;
  lineHeight?: string | number;
  className?: string;
}

// 卡片骨架组件
export const SkeletonCard = ({
  imageHeight = 200,
  titleWidth = '75%',
  lines = 3,
  lineHeight = 16,
  className = '',
}: SkeletonCardProps) => {
  return (
    <div className={`overflow-hidden rounded-lg p-4 ${className}`}>
      <Skeleton height={imageHeight} rounded="md" className="mb-4" />
      <Skeleton height={24} width={titleWidth} className="mb-2" />
      <Skeleton count={lines} height={lineHeight} className="mb-2" />
    </div>
  );
};

interface SkeletonListProps {
  items?: number;
  itemHeight?: string | number;
  className?: string;
}

// 列表骨架组件
export const SkeletonList = ({
  items = 5,
  itemHeight = 60,
  className = '',
}: SkeletonListProps) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array(items).fill(0).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 rounded-md bg-white/80">
          <Skeleton circle height={40} width={40} />
          <div className="flex-1">
            <Skeleton height={16} width="60%" className="mb-2" />
            <Skeleton height={14} width="90%" />
          </div>
        </div>
      ))}
    </div>
  );
};

interface SkeletonDashboardProps {
  className?: string;
}

// 仪表盘骨架组件
export const SkeletonDashboard = ({
  className = '',
}: SkeletonDashboardProps) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* 卡片行 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array(3).fill(0).map((_, index) => (
          <div key={index} className="bg-white/80 rounded-lg p-4">
            <Skeleton height={24} width="50%" className="mb-2" />
            <Skeleton height={40} className="mb-1" />
            <Skeleton height={16} width="30%" />
          </div>
        ))}
      </div>
      
      {/* 图表区域 */}
      <div className="bg-white/80 rounded-lg p-4">
        <Skeleton height={30} width="30%" className="mb-4" />
        <Skeleton height={250} className="mb-2" />
      </div>
      
      {/* 列表区域 */}
      <div className="bg-white/80 rounded-lg p-4">
        <Skeleton height={30} width="20%" className="mb-4" />
        <SkeletonList items={3} />
      </div>
    </div>
  );
}; 