'use client';

import { useEffect, useRef, useState } from 'react';
import { Marker } from '@react-google-maps/api';

interface MapMarkerProps {
  position: google.maps.LatLngLiteral;
  draggable?: boolean;
  icon?: string;
  onClick?: () => void;
  onDragEnd?: (e: google.maps.MapMouseEvent) => void;
}

export default function MapMarker({ 
  position, 
  draggable = false, 
  icon,
  onClick, 
  onDragEnd 
}: MapMarkerProps) {
  // 谷歌警告Marker已弃用，但我们暂时仍使用它
  // 忽略控制台警告，在将来的版本中我们会迁移到AdvancedMarkerElement
  // 现在尝试使用AdvancedMarkerElement会引入额外的加载问题
  return (
    <Marker
      position={position}
      draggable={draggable}
      icon={icon}
      onClick={onClick}
      onDragEnd={onDragEnd}
    />
  );
} 