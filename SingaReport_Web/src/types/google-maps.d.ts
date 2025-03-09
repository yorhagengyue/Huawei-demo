declare namespace google.maps {
  interface MapOptions {
    center: LatLngLiteral;
    zoom: number;
    mapTypeControl?: boolean;
    streetViewControl?: boolean;
    fullscreenControl?: boolean;
    zoomControl?: boolean;
    mapId?: string;
  }

  interface MapMouseEvent {
    latLng: LatLng;
  }

  interface LatLng {
    lat(): number;
    lng(): number;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  interface GeocoderRequest {
    address?: string;
    location?: LatLngLiteral;
  }

  interface GeocoderResult {
    formatted_address: string;
    geometry: {
      location: {
        lat(): number;
        lng(): number;
      };
    };
  }

  interface MarkerOptions {
    position: LatLngLiteral;
    map: Map;
    animation?: Animation;
    draggable?: boolean;
  }

  interface Animation {
    DROP: number;
  }

  class Map {
    constructor(mapDiv: Element, opts?: MapOptions);
    setCenter(latLng: LatLng | LatLngLiteral): void;
    setZoom(zoom: number): void;
    panTo(latLng: LatLng | LatLngLiteral): void;
    addListener(eventName: string, handler: Function): any;
  }

  class Marker {
    constructor(opts: MarkerOptions);
    setPosition(latLng: LatLng | LatLngLiteral): void;
    getPosition(): LatLng;
    addListener(eventName: string, handler: Function): any;
  }

  class Geocoder {
    geocode(
      request: GeocoderRequest,
      callback: (results: GeocoderResult[] | null, status: string) => void
    ): void;
  }
}

interface Window {
  google: {
    maps: typeof google.maps;
  };
}

declare namespace google {
  namespace maps {
    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      [key: string]: any;
    }

    interface MapMouseEvent {
      latLng?: LatLng;
    }

    interface LatLng {
      constructor(lat: number, lng: number, noWrap?: boolean);
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface MarkerOptions {
      position: LatLng | LatLngLiteral;
      map?: Map;
      icon?: string | Icon | Symbol;
      draggable?: boolean;
      [key: string]: any;
    }

    interface Icon {
      url: string;
      [key: string]: any;
    }

    interface Symbol {
      path: string;
      [key: string]: any;
    }

    class Geocoder {
      geocode(request: GeocoderRequest, callback: (results: GeocoderResult[], status: string) => void): void;
    }

    namespace places {
      class SearchBox {
        constructor(inputField: HTMLInputElement, opts?: SearchBoxOptions);
        getPlaces(): PlaceResult[];
        setBounds(bounds: any): void;
      }

      interface SearchBoxOptions {
        bounds?: any;
      }

      interface PlaceResult {
        formatted_address?: string;
        geometry?: {
          location: LatLng;
        };
        [key: string]: any;
      }
    }
  }
} 