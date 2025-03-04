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
  // 检查客户端环境 - 移动到组件开始
  const [isClient, setIsClient] = useState(false);
  
  // 使用useEffect确保组件仅在客户端执行与google maps相关的代码
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // 在客户端环境中初始化状态
  const [markerPosition, setMarkerPosition] = useState<any>(null);
  const [address, setAddress] = useState('');
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  
  // 仅在客户端环境中设置初始位置
  useEffect(() => {
    if (isClient && initialLocation?.latitude && initialLocation?.longitude) {
      setMarkerPosition({ 
        lat: initialLocation.latitude, 
        lng: initialLocation.longitude 
      });
      setAddress(initialLocation?.address || '');
    }
  }, [isClient, initialLocation]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng || !isClient) return;
    
    const newPosition = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    setMarkerPosition(newPosition);
    setGeocodeError(null);
    
    // 确保在客户端环境中且window.google已定义
    if (isClient && typeof window !== 'undefined' && window.google) {
      try {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: newPosition }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const newAddress = results[0].formatted_address;
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
      // 如果Google API未加载，仍然更新位置但不进行地理编码
      onLocationSelected({
        latitude: newPosition.lat,
        longitude: newPosition.lng,
        address: ''
      });
    }
  }, [onLocationSelected, isClient]);

  const handleMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng || !isClient) return;
    
    const newPosition = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    setMarkerPosition(newPosition);
    setGeocodeError(null);
    
    // 确保在客户端环境且window.google已定义
    if (isClient && typeof window !== 'undefined' && window.google) {
      try {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: newPosition }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const newAddress = results[0].formatted_address;
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
      // 如果Google API未加载，仍然更新位置但不进行地理编码
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
    
    const newPosition = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
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

  // 为服务器渲染和客户端渲染提供一致的结构
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
        <p>Click on the map to select a location or use the search box to find an address. You can drag the marker to adjust the location.</p>
      </div>
    </div>
  );
} 