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

// Default Singapore boundaries
const DEFAULT_SINGAPORE_BOUNDS = {
  north: 1.4504,  // Northern boundary
  south: 1.1304,  // Southern boundary
  east: 104.0904, // Eastern boundary
  west: 103.6055  // Western boundary
};

// Libraries needed for the Maps API
const libraries: LoadScriptProps['libraries'] = ['places'];

interface MapContainerProps {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  onClick?: (e: google.maps.MapMouseEvent) => void;
  children?: React.ReactNode;
  mapContainerStyle?: React.CSSProperties;
  restrictToBounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export default function MapContainer({ 
  center = defaultCenter, 
  zoom = 12, 
  onClick, 
  children,
  mapContainerStyle = containerStyle,
  restrictToBounds
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
      restrictToBounds={restrictToBounds}
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
  mapContainerStyle,
  restrictToBounds
}: MapContainerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Use the passed boundaries or default Singapore boundaries
  const bounds = restrictToBounds || DEFAULT_SINGAPORE_BOUNDS;

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
    
    // Set map boundary restrictions
    if (map && bounds) {
      // Create boundary rectangle
      const boundLimits = new google.maps.LatLngBounds(
        new google.maps.LatLng(bounds.south, bounds.west),
        new google.maps.LatLng(bounds.north, bounds.east)
      );
      
      // Set initial view to be within boundaries
      map.fitBounds(boundLimits);
      
      // Add boundary restriction listener
      map.addListener('dragend', () => {
        const center = map.getCenter();
        if (!center) return;
        
        // Get current map center position
        let lat = center.lat();
        let lng = center.lng();
        
        // Check if out of bounds and correct
        let changed = false;
        if (lat > bounds.north) {
          lat = bounds.north;
          changed = true;
        } else if (lat < bounds.south) {
          lat = bounds.south;
          changed = true;
        }
        
        if (lng > bounds.east) {
          lng = bounds.east;
          changed = true;
        } else if (lng < bounds.west) {
          lng = bounds.west;
          changed = true;
        }
        
        // If position is out of bounds, move the map back within boundaries
        if (changed) {
          map.panTo(new google.maps.LatLng(lat, lng));
        }
      });
    }
  }, [bounds]);

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
        fullscreenControl: false,
        // Set map visual range restriction
        restriction: {
          latLngBounds: {
            north: bounds.north,
            south: bounds.south,
            east: bounds.east,
            west: bounds.west
          },
          strictBounds: true
        }
      }}
    >
      {children}
    </GoogleMap>
  );
} 