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
  // Google warns that Marker is deprecated, but we'll continue using it for now
  // We'll ignore console warnings and migrate to AdvancedMarkerElement in future versions
  // Using AdvancedMarkerElement now would introduce additional loading issues
  
  // Add console log for debugging
  useEffect(() => {
    console.log('Rendering marker at position:', position);
  }, [position]);
  
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