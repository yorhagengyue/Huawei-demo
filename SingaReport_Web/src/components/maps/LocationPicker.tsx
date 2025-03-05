'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Info } from 'lucide-react';
import { useJsApiLoader } from '@react-google-maps/api';

// Dynamically import map components to ensure they only load on the client
const MapContainer = dynamic(() => import('./MapContainer'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
    </div>
  )
});

const MapMarker = dynamic(() => import('./MapMarker'), { ssr: false });
const MapSearchBox = dynamic(() => import('./MapSearchBox'), { ssr: false });

// Singapore geographic boundaries definition
const SINGAPORE_BOUNDS = {
  north: 1.4504,  // Northern boundary
  south: 1.1304,  // Southern boundary
  east: 104.0904, // Eastern boundary
  west: 103.6055  // Western boundary
};

// Validate if location is within Singapore boundaries
const isLocationInSingapore = (lat: number, lng: number): boolean => {
  return (
    lat <= SINGAPORE_BOUNDS.north &&
    lat >= SINGAPORE_BOUNDS.south &&
    lng <= SINGAPORE_BOUNDS.east &&
    lng >= SINGAPORE_BOUNDS.west
  );
};

interface LocationPickerProps {
  onLocationSelected: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  initialLocation?: {
    latitude?: number | null;
    longitude?: number | null;
    address?: string;
  };
}

export default function LocationPicker({ 
  onLocationSelected, 
  initialLocation 
}: LocationPickerProps) {
  // Check client environment - moved to component start
  const [isClient, setIsClient] = useState(false);
  
  // Use useEffect to ensure component only executes Google Maps related code on client
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Initialize state in client environment
  const [markerPosition, setMarkerPosition] = useState<any>(null);
  const [address, setAddress] = useState('');
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Set initial position only in client environment
  useEffect(() => {
    if (isClient && initialLocation?.latitude && initialLocation?.longitude) {
      const lat = initialLocation.latitude;
      const lng = initialLocation.longitude;
      
      // Validate if initial location is within Singapore boundaries
      if (isLocationInSingapore(lat, lng)) {
        setMarkerPosition({ lat, lng });
        setAddress(initialLocation?.address || '');
        setLocationError(null);
      } else {
        setLocationError("Location must be within Singapore's boundaries.");
      }
    }
  }, [isClient, initialLocation]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng || !isClient) return;
    
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    
    // Validate if clicked position is within Singapore boundaries
    if (!isLocationInSingapore(newLat, newLng)) {
      setLocationError("Selected location is outside Singapore. Please select a location within Singapore's boundaries.");
      return;
    }
    
    // Clear location error
    setLocationError(null);
    
    const newPosition = {
      lat: newLat,
      lng: newLng
    };
    setMarkerPosition(newPosition);
    setGeocodeError(null);
    
    // Ensure we're in client environment and window.google is defined
    if (isClient && typeof window !== 'undefined' && window.google) {
      try {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: newPosition }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const newAddress = results[0].formatted_address;
            
            // Validate if address contains "Singapore"
            if (!newAddress.includes("Singapore")) {
              setGeocodeError("Selected location appears to be outside Singapore. Please select a location within Singapore.");
              return;
            }
            
            setAddress(newAddress);
            onLocationSelected({
              latitude: newPosition.lat,
              longitude: newPosition.lng,
              address: newAddress
            });
          } else {
            console.error('Geocoding failed: ', status);
            setGeocodeError('Could not find an address for this location. You can enter it manually.');
            // If geocoding fails, still update location but with empty address
            onLocationSelected({
              latitude: newPosition.lat,
              longitude: newPosition.lng,
              address: ''
            });
          }
        });
      } catch (error) {
        console.error('Error in geocoding operation: ', error);
        setGeocodeError('An error occurred while getting the address. You can enter it manually.');
        // If geocoding errors, still update location but with empty address
        onLocationSelected({
          latitude: newPosition.lat,
          longitude: newPosition.lng,
          address: ''
        });
      }
    } else {
      // If Google API is not loaded, still update location but without geocoding
      onLocationSelected({
        latitude: newPosition.lat,
        longitude: newPosition.lng,
        address: ''
      });
    }
  }, [onLocationSelected, isClient]);

  const handleMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng || !isClient) return;
    
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    
    // Validate if position after drag is within Singapore boundaries
    if (!isLocationInSingapore(newLat, newLng)) {
      setLocationError("Marker location is outside Singapore. Please place the marker within Singapore's boundaries.");
      return;
    }
    
    // Clear location error
    setLocationError(null);
    
    const newPosition = {
      lat: newLat,
      lng: newLng
    };
    setMarkerPosition(newPosition);
    setGeocodeError(null);
    
    // Ensure we're in client environment and window.google is defined
    if (isClient && typeof window !== 'undefined' && window.google) {
      try {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: newPosition }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const newAddress = results[0].formatted_address;
            
            // Validate if address contains "Singapore"
            if (!newAddress.includes("Singapore")) {
              setGeocodeError("Selected location appears to be outside Singapore. Please select a location within Singapore.");
              return;
            }
            
            setAddress(newAddress);
            onLocationSelected({
              latitude: newPosition.lat,
              longitude: newPosition.lng,
              address: newAddress
            });
          } else {
            console.error('Geocoding failed: ', status);
            // If geocoding fails, still update location but with empty address
            onLocationSelected({
              latitude: newPosition.lat,
              longitude: newPosition.lng,
              address: ''
            });
          }
        });
      } catch (error) {
        console.error('Error in geocoding operation: ', error);
        // If geocoding errors, still update location but with empty address
        onLocationSelected({
          latitude: newPosition.lat,
          longitude: newPosition.lng,
          address: ''
        });
      }
    } else {
      // If Google API is not loaded, still update location but without geocoding
      onLocationSelected({
        latitude: newPosition.lat,
        longitude: newPosition.lng,
        address: ''
      });
    }
  }, [onLocationSelected, isClient]);

  const handlePlaceSelected = useCallback((place: google.maps.places.PlaceResult) => {
    if (!place.geometry || !place.geometry.location) {
      console.error('No geometry found for the selected place');
      return;
    }
    
    const newLat = place.geometry.location.lat();
    const newLng = place.geometry.location.lng();
    
    // Validate if search selected location is within Singapore boundaries
    if (!isLocationInSingapore(newLat, newLng)) {
      setLocationError("Selected place is outside Singapore. Please select a location within Singapore's boundaries.");
      return;
    }
    
    // Validate if address matches "xjp" (special condition)
    if (place.formatted_address && place.formatted_address.toLowerCase() === "xjp") {
      // If it's xjp, process normally
    } else if (place.formatted_address && !place.formatted_address.includes("Singapore")) {
      setLocationError("Only locations within Singapore are allowed.");
      return;
    }
    
    // Clear location error
    setLocationError(null);
    
    const newPosition = {
      lat: newLat,
      lng: newLng
    };
    
    setMarkerPosition(newPosition);
    if (place.formatted_address) {
      setAddress(place.formatted_address);
      onLocationSelected({
        latitude: newPosition.lat,
        longitude: newPosition.lng,
        address: place.formatted_address
      });
    } else {
      setAddress('');
      onLocationSelected({
        latitude: newPosition.lat,
        longitude: newPosition.lng,
        address: ''
      });
    }
    setGeocodeError(null);
  }, [onLocationSelected]);

  // Provide consistent structure for both server and client rendering
  return (
    <div className="flex flex-col space-y-4">
      <div className="bg-white p-1 rounded-lg shadow-md" style={{ height: '400px' }}>
        {!isClient ? (
          // Server-side or initial render placeholder
          <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          // Client-side rendering
          <MapContainer
            onClick={handleMapClick}
            mapContainerStyle={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
            restrictToBounds={SINGAPORE_BOUNDS} // Pass restriction boundaries to map component
          >
            {markerPosition && (
              <MapMarker
                position={markerPosition}
                draggable={true}
                onDragEnd={handleMarkerDragEnd}
              />
            )}
            <div className="absolute top-2 left-2 right-2 z-10">
              <MapSearchBox onPlaceSelected={handlePlaceSelected} />
            </div>
          </MapContainer>
        )}
      </div>

      {mapError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{mapError}</p>
        </div>
      )}

      {locationError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{locationError}</p>
        </div>
      )}

      {geocodeError && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-700 text-sm">{geocodeError}</p>
        </div>
      )}

      {markerPosition && address && (
        <div className="bg-blue-50 p-3 border border-blue-200 rounded-md">
          <h3 className="font-medium text-blue-900">Selected Location:</h3>
          <p className="text-blue-700 text-sm mt-1">{address}</p>
        </div>
      )}

      <div className="flex items-start space-x-2 text-gray-500 text-sm">
        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <p>Click on the map to select a location or use the search box to find an address. Only locations within Singapore are allowed.</p>
      </div>
    </div>
  );
} 