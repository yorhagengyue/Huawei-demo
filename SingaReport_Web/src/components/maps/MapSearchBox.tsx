'use client';

import { useRef, useState, useEffect } from 'react';
import { StandaloneSearchBox } from '@react-google-maps/api';

interface MapSearchBoxProps {
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
}

export default function MapSearchBox({ 
  onPlaceSelected, 
  placeholder = "Search for a location" 
}: MapSearchBoxProps) {
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Check if we're in browser environment
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(typeof window !== 'undefined');
  }, []);

  const onLoad = (ref: google.maps.places.SearchBox) => {
    console.log('SearchBox loaded');
    setSearchBox(ref);
    setSearchError(null);
  };

  const onUnmount = () => {
    console.log('SearchBox unmounted');
    setSearchBox(null);
  };

  // Add and remove event listeners
  useEffect(() => {
    if (!searchBox || !isClient || typeof window.google === 'undefined') return;
    
    try {
      const placesChangedListener = searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();
        if (places && places.length > 0) {
          console.log('Selected place:', places[0]);
          onPlaceSelected(places[0]);
          setSearchError(null);
        } else {
          console.warn('No places selected');
          setSearchError('No results found. Please try a different search.');
        }
      });

      return () => {
        if (window.google && google.maps && placesChangedListener) {
          google.maps.event.removeListener(placesChangedListener);
        }
      };
    } catch (error) {
      console.error('Error in places search:', error);
      setSearchError('An error occurred during search. Please try again.');
    }
  }, [searchBox, onPlaceSelected, isClient]);

  // If not client-side, render a placeholder to ensure consistent rendering
  if (!isClient) {
    return (
      <div className="relative">
        <div className="relative bg-white rounded-md shadow-lg">
          <input
            type="text"
            placeholder={placeholder}
            className="w-full p-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <StandaloneSearchBox
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        <div className="relative bg-white rounded-md shadow-lg">
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            className="w-full p-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </StandaloneSearchBox>
      
      {searchError && (
        <div className="mt-2 text-sm text-red-600">
          {searchError}
        </div>
      )}
    </div>
  );
} 