'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Search, Info } from 'lucide-react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useAuth } from '@/contexts/AuthContext';
import AuthRequiredDialog from '@/components/common/AuthRequiredDialog';

// Singapore center coordinates
const DEFAULT_CENTER = { lat: 1.3521, lng: 103.8198 };
const DEFAULT_ZOOM = 12;

// Map container styles
const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

// Libraries to load
const libraries = ['places'];

// Report creation steps
const STEPS = {
  LOCATION: 0,
  CATEGORY: 1,
  DETAILS: 2,
  REVIEW: 3
};

// 全局变量跟踪脚本加载状态
let googleMapsScriptAdded = false;

// 在组件外部定义全局回调函数
if (typeof window !== 'undefined') {
  window.initGoogleMapsCallback = function() {
    // 这个函数只是一个通知，实际初始化会在组件内执行
    window.googleMapsLoaded = true;
    const event = new Event('google-maps-loaded');
    window.dispatchEvent(event);
  };
}

export default function ReportLocationPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [scriptLoading, setScriptLoading] = useState(false);
  
  // References
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const apiLoadedRef = useRef(false);
  const initAttemptedRef = useRef(false);
  
  // Current step
  const currentStep = STEPS.LOCATION;
  
  // Progress calculation
  const progress = ((currentStep + 1) / Object.keys(STEPS).length) * 100;

  // Authentication check
  useEffect(() => {
    // Log authentication state for debugging
    console.log('Auth state in LocationPage:', {
      isAuthenticated,
      isLoading,
      authChecked
    });
    
    // Verify authentication
    const verifyAuth = async () => {
      try {
        console.log('Starting authentication verification in LocationPage');
        const isAuth = await checkAuth();
        console.log('Authentication result in LocationPage:', isAuth);
        setAuthChecked(true);
      } catch (err) {
        console.error('Authentication check failed in LocationPage:', err);
        setAuthChecked(true);
      }
    };
    
    if (!authChecked && !isLoading) {
      verifyAuth();
    }
  }, [isAuthenticated, isLoading, checkAuth, authChecked]);
  
  // Redirect if not authenticated
  useEffect(() => {
    // Only take action after auth check is complete and not loading
    if (authChecked && !isLoading) {
      if (!isAuthenticated) {
        console.log('User is not authenticated in LocationPage, showing dialog');
        setShowAuthDialog(true);
      } else {
        console.log('User is authenticated in LocationPage');
      }
    }
  }, [authChecked, isAuthenticated, isLoading, router]);
  
  // 检查Google地图API是否已加载并初始化地图
  const checkAndInitMap = useCallback(() => {
    if (window.google?.maps && mapRef.current && !initAttemptedRef.current) {
      initAttemptedRef.current = true;
      console.log('Google Maps已加载，直接初始化地图');
      setMapLoaded(true);
      setScriptLoading(false);
      
      // 初始化地图和自动完成
      try {
        initMap();
        initAutocomplete();
      } catch (err) {
        console.error('初始化地图时出错:', err);
        setError('初始化地图时出错，请刷新页面重试');
      }
      return true;
    }
    return false;
  }, []);
  
  // 加载Google Maps API脚本
  useEffect(() => {
    console.log('地图加载useEffect触发', {
      apiAlreadyLoaded: !!window.google?.maps,
      scriptAlreadyAdded: googleMapsScriptAdded,
      scriptLoading
    });

    // 先检查Google Maps是否已加载
    if (checkAndInitMap()) {
      return;
    }

    // 如果脚本已添加但地图未加载完成，等待加载
    if (googleMapsScriptAdded && !window.google?.maps) {
      setScriptLoading(true);
      console.log('脚本已添加但还未加载完成，等待中...');
      return;
    }

    // 避免重复加载脚本
    if (googleMapsScriptAdded || scriptLoading) {
      return;
    }
    
    const loadGoogleMapsApi = () => {
      setScriptLoading(true);
      googleMapsScriptAdded = true;
      
      // 创建脚本元素
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMapsCallback`;
      script.async = true;
      script.defer = true;
      
      // 处理加载错误
      script.onerror = () => {
        setScriptLoading(false);
        setError('加载Google Maps失败。请刷新页面重试。');
      };
      
      document.head.appendChild(script);
      console.log('Google Maps脚本已添加到页面');
    };
    
    // 监听自定义事件
    const handleGoogleMapsLoaded = () => {
      console.log('接收到Google Maps加载完成事件');
      checkAndInitMap();
    };
    
    // 添加事件监听器
    window.addEventListener('google-maps-loaded', handleGoogleMapsLoaded);
    
    // 开始加载脚本
    loadGoogleMapsApi();
    
    // 添加超时检测
    const timeoutId = setTimeout(() => {
      if (!window.google?.maps) {
        console.log('Google Maps加载超时，尝试强制初始化');
        if (window.google?.maps) {
          checkAndInitMap();
        } else {
          setError('加载Google Maps超时。请检查网络连接并刷新页面。');
        }
      }
    }, 10000); // 10秒超时
    
    // 清理函数
    return () => {
      window.removeEventListener('google-maps-loaded', handleGoogleMapsLoaded);
      clearTimeout(timeoutId);
    };
  }, [checkAndInitMap]);
  
  // 额外的定期检查以确保地图加载
  useEffect(() => {
    if (mapLoaded || !googleMapsScriptAdded) return;
    
    const intervalId = setInterval(() => {
      console.log('定期检查Google Maps是否已加载');
      if (window.google?.maps) {
        checkAndInitMap();
        clearInterval(intervalId);
      }
    }, 1000); // 每秒检查一次
    
    return () => clearInterval(intervalId);
  }, [mapLoaded, checkAndInitMap]);
  
  // 初始化地图
  const initMap = useCallback(() => {
    console.log('初始化地图', {mapRef: !!mapRef.current, googleMaps: !!window.google?.maps});
    
    if (!mapRef.current || !window.google?.maps) return;
    
    try {
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });
      
      console.log('地图实例已创建');
      setMap(mapInstance);
      
      // 添加点击事件处理
      mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
        handleMapClick(event);
      });
      
      setMapLoaded(true);
    } catch (err) {
      console.error('创建地图实例时出错:', err);
      setError('创建地图实例时出错。请刷新页面重试。');
    }
  }, []);
  
  // 初始化自动完成
  const initAutocomplete = useCallback(() => {
    if (!inputRef.current || !window.google?.maps?.places) return;
    
    try {
      const autocompleteInstance = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: ['sg'] }
      });
      
      setAutocomplete(autocompleteInstance);
      
      // 添加地点选择事件处理
      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace();
        
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          
          setSelectedLocation({ lat, lng });
          setLocationAddress(place.formatted_address || '');
          
          // Center map on selected location
          if (map) {
            map.panTo({ lat, lng });
            map.setZoom(16);
          }
        }
      });
    } catch (err) {
      console.error('初始化地址自动完成时出错:', err);
    }
  }, [map]);
  
  // Handle map click to set marker
  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      setSelectedLocation({ lat, lng });
      
      // Get address using Geocoder
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          setLocationAddress(results[0].formatted_address);
        } else {
          setLocationAddress(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
      });
    }
  }, []);
  
  // Handle getting current location
  const handleGetCurrentLocation = () => {
    setLoadingLocation(true);
    setError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setSelectedLocation({ lat, lng });
          
          // Center map on current location
          if (map) {
            map.panTo({ lat, lng });
            map.setZoom(16);
          }
          
          // Get address using Geocoder
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              setLocationAddress(results[0].formatted_address);
            } else {
              setLocationAddress(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            }
            setLoadingLocation(false);
          });
        },
        (error) => {
          setLoadingLocation(false);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setError("Location permission denied. Please allow browser to access your location.");
              break;
            case error.POSITION_UNAVAILABLE:
              setError("Location information is unavailable.");
              break;
            case error.TIMEOUT:
              setError("Location request timed out.");
              break;
            default:
              setError("An error occurred while getting your location.");
              break;
          }
        },
        { 
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      setLoadingLocation(false);
      setError("Your browser doesn't support geolocation.");
    }
  };

  // Handle marker drag
  const handleMarkerDragEnd = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      setSelectedLocation({ lat, lng });
      
      // Get address using Geocoder
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          setLocationAddress(results[0].formatted_address);
        } else {
          setLocationAddress(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
      });
    }
  }, []);

  // Handle next button click
  const handleNext = () => {
    try {
      if (!selectedLocation) {
        setError("Please select a location");
        return;
      }

      // Store location data in sessionStorage
      sessionStorage.setItem('reportLocation', JSON.stringify({
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        address: locationAddress
      }));

      // Navigate to next step
      router.push('/report/create/category');
    } catch (err) {
      console.error("Error saving location:", err);
      setError("Error saving location information");
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    router.push('/dashboard');
  };

  // 类型兼容性问题，使用any类型临时解决
  const markerRef = useRef<any>(null);
  
  // 更新地图标记
  useEffect(() => {
    if (!map || !selectedLocation || !window.google?.maps) return;
    
    // 清理之前的标记
    if (markerRef.current) {
      google.maps.event.clearInstanceListeners(markerRef.current);
      markerRef.current.setMap(null);
    }
    
    // 创建新标记
    const marker = new google.maps.Marker({
      position: selectedLocation,
      map: map,
      draggable: true,
    });
    
    // 添加拖动结束事件
    const listener = marker.addListener('dragend', handleMarkerDragEnd);
    
    // 保存标记引用
    markerRef.current = marker;
    
    // 清理函数
    return () => {
      if (markerRef.current) {
        google.maps.event.clearInstanceListeners(markerRef.current);
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    };
  }, [map, selectedLocation, handleMarkerDragEnd]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Report an Issue</h1>

      {/* Progress bar */}
      <div className="mb-8 bg-gray-100 h-2 rounded-full">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Step indicator */}
      <div className="flex justify-between mb-6 text-sm text-gray-500">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mb-1">1</div>
          <span>Location</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center mb-1">2</div>
          <span>Category</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center mb-1">3</div>
          <span>Details</span>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Where is the issue located?</h2>

      {/* Error message display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          <p className="flex items-center">
            <span className="mr-2">⚠️</span>
            {error}
          </p>
        </div>
      )}

      {/* Map search */}
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for address or landmark..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Location button */}
      <div className="mb-4">
        <button
          onClick={handleGetCurrentLocation}
          disabled={loadingLocation}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {loadingLocation ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              <span>Getting location...</span>
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4" />
              <span>Use my current location</span>
            </>
          )}
        </button>
      </div>

      {/* Map container */}
      <div className="rounded-md overflow-hidden border border-gray-300 mb-4">
        {!mapLoaded && (
          <div className="h-[400px] flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-gray-500">Loading map...</p>
            </div>
          </div>
        )}
        <div 
          ref={mapRef} 
          style={mapContainerStyle}
          className={!mapLoaded ? 'hidden' : ''}
        />
      </div>

      {/* Selected location display */}
      {selectedLocation && (
        <div className="bg-blue-50 p-3 rounded-md border border-blue-200 mb-4">
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800">Selected Location</p>
              <p className="text-sm text-blue-700">{locationAddress}</p>
              <p className="text-xs text-blue-600 mt-1">
                Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mb-6">
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p>Click on the map to select the issue location or use the search box to find an address. You can drag the marker to adjust the exact location.</p>
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          onClick={handleCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleNext}
          className={`px-4 py-2 bg-primary text-white rounded-md ${
            !selectedLocation ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'
          }`}
          disabled={!selectedLocation}
        >
          Next
        </button>
      </div>

      {/* Add Auth Required Dialog */}
      <AuthRequiredDialog
        isOpen={showAuthDialog}
        setIsOpen={(open) => {
          setShowAuthDialog(open);
          if (!open) {
            router.push('/dashboard');
          }
        }}
        title="Authentication Required"
        message="You need to be logged in to report an issue. Please log in or create an account to continue."
        returnUrl="/report/create/location"
      />
    </div>
  );
}

// 声明全局回调函数类型
declare global {
  interface Window {
    initGoogleMapsCallback: () => void;
    googleMapsLoaded?: boolean;
    google: {
      maps: typeof google.maps;
    };
  }
} 