import * as React from 'react';
import { useState, useCallback, useRef } from 'react';

interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  markers?: Array<{
    id: string;
    position: { lat: number; lng: number };
    title: string;
    phase?: 'DREAM' | 'PLAN' | 'ACT' | 'CELEBRATE';
    onClick?: () => void;
  }>;
  className?: string;
}

export const GoogleMap = ({ center, zoom = 15, onLocationSelect, markers = [], className = '' }: GoogleMapProps) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const getPhaseColor = (phase?: string) => {
    switch (phase) {
      case 'DREAM': return '#EF4444'; // Red
      case 'PLAN': return '#F59E0B'; // Yellow
      case 'ACT': return '#3B82F6'; // Blue
      case 'CELEBRATE': return '#10B981'; // Green
      default: return '#6B7280'; // Gray
    }
  };

  const initializeMap = useCallback((mapElement: HTMLDivElement) => {
    if (!window.google || !mapElement) return;

    const map = new google.maps.Map(mapElement, {
      center,
      zoom,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    mapRef.current = map;

    // Add click listener for location selection
    if (onLocationSelect) {
      map.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          onLocationSelect({
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          });
        }
      });
    }

    setIsLoaded(true);
  }, [center, zoom, onLocationSelect]);

  // Update markers when they change
  React.useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    markers.forEach(markerData => {
      const marker = new google.maps.Marker({
        position: markerData.position,
        map: mapRef.current,
        title: markerData.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: getPhaseColor(markerData.phase),
          fillOpacity: 0.8,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
      });

      if (markerData.onClick) {
        marker.addListener('click', markerData.onClick);
      }

      markersRef.current.push(marker);
    });
  }, [markers, isLoaded]);

  // Update map center when it changes
  React.useEffect(() => {
    if (mapRef.current && isLoaded) {
      mapRef.current.setCenter(center);
    }
  }, [center, isLoaded]);

  const mapElementRef = useCallback((element: HTMLDivElement | null) => {
    if (element && window.google) {
      initializeMap(element);
    }
  }, [initializeMap]);

  // Wait for Google Maps to load
  React.useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        return true;
      }
      return false;
    };

    if (checkGoogleMaps()) {
      return;
    }

    const interval = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(interval);
        // Force re-render when Google Maps is loaded
        setIsLoaded(false);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  if (!window.google) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <p className="text-gray-500">Carregando mapa...</p>
      </div>
    );
  }

  return <div ref={mapElementRef} className={`w-full h-full ${className}`} />;
};