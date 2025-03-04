declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      [key: string]: any;
    }

    class LatLng {
      constructor(lat: number, lng: number, noWrap?: boolean);
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
      setPosition(latLng: LatLng | LatLngLiteral): void;
      setIcon(icon: string | Icon | Symbol): void;
      setDraggable(draggable: boolean): void;
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

    interface MapMouseEvent {
      latLng?: LatLng;
    }

    class Geocoder {
      geocode(request: GeocoderRequest, callback: (results: GeocoderResult[], status: string) => void): void;
    }

    interface GeocoderRequest {
      address?: string;
      location?: LatLng | LatLngLiteral;
      [key: string]: any;
    }

    interface GeocoderResult {
      formatted_address: string;
      geometry: {
        location: LatLng;
      };
      [key: string]: any;
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