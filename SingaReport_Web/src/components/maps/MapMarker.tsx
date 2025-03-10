'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';

// 添加报告信息接口
interface ReportInfo {
  id: string;
  title: string;
  description?: string;
  status?: string;
  category?: string;
  severity?: string;
  location?: string;
  createdAt?: string;
}

interface MapMarkerProps {
  position: google.maps.LatLngLiteral;
  draggable?: boolean;
  icon?: string;
  onClick?: () => void;
  onDragEnd?: (e: google.maps.MapMouseEvent) => void;
  // 添加报告信息和悬停提示选项
  reportInfo?: ReportInfo;
  showTooltip?: boolean;
  // 添加聚类相关属性
  isClusterable?: boolean;
  zIndex?: number;
  // 添加标记聚类支持
  clusterer?: any; // Using any type to avoid import complexities
}

export default function MapMarker({ 
  position, 
  draggable = false, 
  icon,
  onClick, 
  onDragEnd,
  reportInfo,
  showTooltip = true,
  isClusterable = true,
  zIndex = 1,
  clusterer
}: MapMarkerProps) {
  // 添加状态管理悬停提示的显示/隐藏
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  
  // 添加定时器引用，用于延迟显示和隐藏
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 在组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);
  
  // 格式化日期
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // 获取状态的颜色
  const getStatusColor = (status?: string) => {
    if (!status) return 'gray';
    
    switch(status.toLowerCase()) {
      case 'open': return 'blue';
      case 'in_progress': 
      case 'in progress': return 'yellow';
      case 'resolved': return 'green';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };
  
  // 获取严重程度的标签和颜色
  const getSeverityInfo = (severity?: string) => {
    if (!severity) return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    
    switch(severity.toLowerCase()) {
      case 'high': return { label: 'High', color: 'bg-red-100 text-red-800' };
      case 'medium': return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
      case 'low': return { label: 'Low', color: 'bg-green-100 text-green-800' };
      default: return { label: severity, color: 'bg-gray-100 text-gray-800' };
    }
  };
  
  // 添加控制台日志
  useEffect(() => {
    console.log('Rendering marker at position:', position);
    if (reportInfo) {
      console.log('With report info:', reportInfo);
    }
  }, [position, reportInfo]);
  
  // 延迟显示提示的处理函数
  const handleShowTooltipWithDelay = useCallback(() => {
    // 清除任何现有的隐藏定时器
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    
    // 设置显示定时器，添加300ms延迟
    if (!isTooltipOpen && !showTimeoutRef.current) {
      showTimeoutRef.current = setTimeout(() => {
        setIsTooltipOpen(true);
        showTimeoutRef.current = null;
      }, 300);
    }
  }, [isTooltipOpen]);
  
  // 延迟隐藏提示的处理函数
  const handleHideTooltipWithDelay = useCallback(() => {
    // 清除任何现有的显示定时器
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    
    // 设置隐藏定时器，添加200ms延迟
    if (isTooltipOpen && !hideTimeoutRef.current) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsTooltipOpen(false);
        hideTimeoutRef.current = null;
      }, 200);
    }
  }, [isTooltipOpen]);
  
  // 定义标记点击处理函数
  const handleMarkerClick = () => {
    if (onClick) {
      onClick();
    } else if (showTooltip && reportInfo) {
      // 切换提示显示状态
      // 清除所有定时器
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      
      setIsTooltipOpen(!isTooltipOpen);
    }
  };
  
  // 定义提示信息窗口上的点击处理
  const handleInfoWindowClick = (e: React.MouseEvent) => {
    // 阻止事件冒泡到标记
    e.stopPropagation();
  };
  
  return (
    <>
      <Marker
        position={position}
        draggable={draggable}
        icon={icon}
        onClick={handleMarkerClick}
        onDragEnd={onDragEnd}
        onMouseOver={handleShowTooltipWithDelay}
        onMouseOut={handleHideTooltipWithDelay}
        zIndex={zIndex}
        clusterer={clusterer}
      />
      
      {showTooltip && reportInfo && isTooltipOpen && (
        <InfoWindow
          position={position}
          onCloseClick={() => setIsTooltipOpen(false)}
          options={{ pixelOffset: new window.google.maps.Size(0, -40) }}
        >
          <div className="p-1 max-w-xs" onClick={handleInfoWindowClick}>
            <div className="font-medium text-gray-900 mb-1">{reportInfo.title}</div>
            
            {reportInfo.status && (
              <div 
                className="inline-block px-2 py-0.5 rounded text-xs mb-1 mr-1"
                style={{ backgroundColor: `${getStatusColor(reportInfo.status)}100`, color: `${getStatusColor(reportInfo.status)}800` }}
              >
                {reportInfo.status}
              </div>
            )}
            
            {reportInfo.severity && (
              <div className={`inline-block px-2 py-0.5 rounded text-xs mb-1 ${getSeverityInfo(reportInfo.severity).color}`}>
                {getSeverityInfo(reportInfo.severity).label}
              </div>
            )}
            
            {reportInfo.description && (
              <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                {reportInfo.description}
              </p>
            )}
            
            {reportInfo.location && (
              <div className="text-xs text-gray-500 mb-1">
                <span className="font-medium">Location:</span> {reportInfo.location}
              </div>
            )}
            
            {reportInfo.createdAt && (
              <div className="text-xs text-gray-500">
                Reported on {formatDate(reportInfo.createdAt)}
              </div>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
} 