'use client';

import React, { useState } from 'react';
import { Loader2, Navigation } from 'lucide-react';

interface CurrentLocationButtonProps {
  onLocationFound: (lat: number, lng: number) => void;
  className?: string;
}

export default function CurrentLocationButton({ onLocationFound, className = '' }: CurrentLocationButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationFound(latitude, longitude);
        setLoading(false);
      },
      // Error callback
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access was denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable at this time.';
            break;
          case error.TIMEOUT:
            errorMessage = 'The request to get your location timed out.';
            break;
        }
        
        setError(errorMessage);
        setLoading(false);
        console.error('Geolocation error:', error);
      },
      // Options
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className={`relative ${className}`}>
      <button 
        onClick={getLocation}
        disabled={loading}
        className="flex items-center gap-1.5 bg-primary text-white border border-primary rounded-md px-3 py-2 text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm disabled:opacity-70"
        title="Use your current location"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Getting location...</span>
          </>
        ) : (
          <>
            <Navigation className="h-4 w-4" />
            <span>Use Current Location</span>
          </>
        )}
      </button>
      
      {error && (
        <div className="absolute top-full left-0 mt-1 bg-red-50 text-red-700 text-xs p-2 rounded-md border border-red-200 w-60 z-10">
          {error}
        </div>
      )}
    </div>
  );
} 