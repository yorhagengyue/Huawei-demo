'use client';

import { InfoWindow } from '@react-google-maps/api';

interface MapInfoWindowProps {
  position: google.maps.LatLngLiteral;
  onClose: () => void;
  children: React.ReactNode;
}

export default function MapInfoWindow({ 
  position, 
  onClose, 
  children 
}: MapInfoWindowProps) {
  return (
    <InfoWindow
      position={position}
      onCloseClick={onClose}
    >
      <div>
        {children}
      </div>
    </InfoWindow>
  );
} 