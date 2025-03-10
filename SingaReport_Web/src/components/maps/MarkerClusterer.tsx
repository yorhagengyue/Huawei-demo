'use client';

import React, { useEffect, useState } from 'react';
import { MarkerClusterer as GoogleMarkerClusterer } from '@react-google-maps/api';

interface MarkerClustererProps {
  children: React.ReactNode;
  options?: {
    gridSize?: number;
    minimumClusterSize?: number;
    zoomOnClick?: boolean;
    maxZoom?: number;
    averageCenter?: boolean;
  };
}

/**
 * MarkerClusterer component that groups nearby markers into clusters
 * 
 * This helps manage map marker density and improves performance and UX when
 * there are many markers close together on the map.
 */
export default function MarkerClusterer({ children, options }: MarkerClustererProps) {
  // Set default options
  const defaultOptions = {
    gridSize: 60,
    minimumClusterSize: 2,
    zoomOnClick: true,
    maxZoom: 15,
    averageCenter: true,
    // Custom cluster styling could be added here
  };
  
  // Merge default options with provided options
  const clusterOptions = { ...defaultOptions, ...options };
  
  // On client side only
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return <>{children}</>;
  }
  
  return (
    <GoogleMarkerClusterer options={clusterOptions}>
      {(clusterer) => {
        // Clone children and add clusterer prop
        return React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            // Check if the child is clusterable
            const isClusterable = child.props.isClusterable !== false;
            
            if (isClusterable) {
              return React.cloneElement(child, { clusterer });
            }
          }
          return child;
        });
      }}
    </GoogleMarkerClusterer>
  );
} 