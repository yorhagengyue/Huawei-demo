'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
  GoogleMap, 
  useJsApiLoader,
  LoadScriptProps
} from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

// Singapore center coordinates
const defaultCenter = {
  lat: 1.3521,
  lng: 103.8198
};

// Libraries needed for the Maps API
const libraries: LoadScriptProps['libraries'] = ['places'];

interface MapContainerProps {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  onClick?: (e: google.maps.MapMouseEvent) => void;
  children?: React.ReactNode;
  mapContainerStyle?: React.CSSProperties;
}

export default function MapContainer({ 
  center = defaultCenter, 
  zoom = 12, 
  onClick, 
  children,
  mapContainerStyle = containerStyle
}: MapContainerProps) {
  // Check if we're in browser environment
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only render the map component on the client
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-500">Map loading...</p>
        </div>
      </div>
    );
  }

  // Now we're sure we're on the client, let's render the map
  return (
    <ClientMap 
      center={center} 
      zoom={zoom} 
      onClick={onClick} 
      mapContainerStyle={mapContainerStyle}
    >
      {children}
    </ClientMap>
  );
}

// Separate client-side component that loads the Google Maps API
function ClientMap({ 
  center, 
  zoom, 
  onClick, 
  children,
  mapContainerStyle 
}: MapContainerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Set error state if map fails to load
  useEffect(() => {
    if (loadError) {
      console.error('Error loading Google Maps API:', loadError);
      setMapError('Failed to load Google Maps. Please check your connection and refresh the page.');
    }
  }, [loadError]);

  const onLoad = useCallback((map: google.maps.Map) => {
    console.log('Map loaded successfully');
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    console.log('Map unmounted');
    setMap(null);
  }, []);

  // Display loading state
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-500">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  // Display error state
  if (mapError) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50 rounded-lg p-4">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <p className="text-red-600 font-medium mb-1">Map Error</p>
          <p className="text-red-600 text-sm">{mapError}</p>
          <button 
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md text-sm"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Render the map
  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={zoom}
      onClick={onClick}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false
      }}
    >
      {children}
    </GoogleMap>
  );
} 