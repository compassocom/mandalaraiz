import * as React from 'react';

interface MapMarker {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  title: string;
  phase?: 'DREAM' | 'PLAN' | 'ACT' | 'CELEBRATE';
  onClick?: () => void;
}

interface GoogleMapProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  markers?: MapMarker[];
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  className?: string;
}

export const GoogleMap = ({ 
  center, 
  zoom = 13, 
  markers = [], 
  onLocationSelect,
  className = "w-full h-full"
}: GoogleMapProps) => {
  const mapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // This is a placeholder implementation
    // In a real app, you would integrate with Google Maps API
    console.log('GoogleMap rendered with:', { center, zoom, markers });
  }, [center, zoom, markers]);

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (onLocationSelect) {
      // Simulate click coordinates (in a real implementation, this would be from Google Maps)
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Convert pixel coordinates to lat/lng (simplified)
      const lat = center.lat + (y - rect.height / 2) / 1000;
      const lng = center.lng + (x - rect.width / 2) / 1000;
      
      onLocationSelect({ lat, lng });
    }
  };

  const getPhaseColor = (phase?: string) => {
    switch (phase) {
      case 'DREAM': return '#ef4444'; // red
      case 'PLAN': return '#f59e0b'; // yellow
      case 'ACT': return '#3b82f6'; // blue
      case 'CELEBRATE': return '#10b981'; // green
      default: return '#6b7280'; // gray
    }
  };

  return (
    <div 
      ref={mapRef}
      className={`${className} bg-gray-100 relative overflow-hidden rounded-lg border`}
      onClick={handleMapClick}
      style={{ cursor: onLocationSelect ? 'crosshair' : 'default' }}
    >
      {/* Map background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100">
        {/* Grid pattern to simulate map */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #000 1px, transparent 1px),
              linear-gradient(to bottom, #000 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
      </div>

      {/* Center marker */}
      <div
        className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2"
        style={{
          left: '50%',
          top: '50%'
        }}
        title="Current Location"
      />

      {/* Dream markers */}
      {markers.map((marker, index) => (
        <div
          key={marker.id}
          className="absolute w-6 h-6 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
          style={{
            backgroundColor: getPhaseColor(marker.phase),
            left: `${50 + (index * 10 - 25)}%`,
            top: `${50 + (index * 8 - 20)}%`
          }}
          onClick={(e) => {
            e.stopPropagation();
            marker.onClick?.();
          }}
          title={marker.title}
        />
      ))}

      {/* Map controls */}
      <div className="absolute top-2 right-2 space-y-1">
        <button className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center text-sm font-bold hover:bg-gray-50">
          +
        </button>
        <button className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center text-sm font-bold hover:bg-gray-50">
          −
        </button>
      </div>

      {/* Instructions */}
      {onLocationSelect && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          Click to select location
        </div>
      )}

      {/* Legend */}
      {markers.length > 0 && (
        <div className="absolute bottom-2 right-2 bg-white rounded shadow-md p-2 text-xs">
          <div className="font-semibold mb-1">Dreams</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Dream</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Plan</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Act</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Celebrate</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};