import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- INSTRUÇÕES DE INSTALAÇÃO ---
// Para que este código funcione, você precisa de instalar as seguintes dependências
// no terminal do seu projeto. O erro "ERESOVE" acontece porque a versão
// mais recente do react-leaflet não é compatível com a versão do React do seu projeto.
//
// Execute os seguintes comandos no seu terminal:
//
// npm install leaflet react-leaflet@^4.2.1
// npm install -D @types/leaflet
//
// --- FIM DAS INSTRUÇÕES ---


// --- Correção para o ícone do marcador ---
// Fix for leaflet marker icons in Vite/React
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});
// --- Fim da correção do ícone ---

// Componente auxiliar para recentralizar o mapa quando a localização muda
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

// Componente auxiliar para lidar com cliques no mapa
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (location: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      // Quando o mapa é clicado, chama a função passada via props
      // com as coordenadas do clique.
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}


// Interface para definir a estrutura dos marcadores que o mapa irá receber
interface MarkerData {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  title: string;
  onClick?: () => void;
}

// Interface para as props do nosso componente de mapa
interface LeafletMapProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  markers: MarkerData[];
  className?: string;
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
}

// Componente principal do mapa, agora mais poderoso e reutilizável
function LeafletMap({ center, zoom, markers, className, onLocationSelect }: LeafletMapProps) {
  return (
    <MapContainer 
      center={[center.lat, center.lng]} 
      zoom={zoom} 
      scrollWheelZoom={false} 
      className={className}
      style={{ height: '100%', width: '100%' }} // Garante que o mapa preenche o contentor
    >
      <ChangeView center={[center.lat, center.lng]} zoom={zoom} />
      
      {/* Camada de mapa do OpenStreetMap */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Mapeia a lista de marcadores recebida via props */}
      {markers.map(marker => (
        <Marker 
          key={marker.id} 
          position={[marker.position.lat, marker.position.lng]}
          eventHandlers={{
            click: () => {
              if (marker.onClick) {
                marker.onClick();
              }
            },
          }}
        >
          <Popup>
            {marker.title}
          </Popup>
        </Marker>
      ))}

      {/* Adiciona o handler de clique apenas se a prop onLocationSelect for fornecida */}
      {onLocationSelect && <MapClickHandler onLocationSelect={onLocationSelect} />}
    </MapContainer>
  );
}

export default LeafletMap;

// --- Como usar este componente na sua DashboardPage.tsx ---
// 1. Crie este ficheiro como 'client/src/components/LeafletMap.tsx'.
//
// 2. No seu ficheiro 'DashboardPage.tsx', importe o novo mapa:
//    import LeafletMap from '@/components/LeafletMap'; // ou o caminho correto
//
// 3. Substitua o componente <GoogleMap ... /> por este:
/*
<div className="h-[500px] rounded-md overflow-hidden">
  <LeafletMap
    center={userLocation}
    zoom={13}
    markers={dreams.map(dream => ({
      id: dream.id.toString(),
      position: {
        lat: dream.location_lat,
        lng: dream.location_lng,
      },
      title: dream.title,
      onClick: () => navigate(`/dream/${dream.id}`),
    }))}
    className="w-full h-full"
  />
</div>
*/

// --- Como usar este componente na sua CreateDreamPage.tsx ---
// 1. No seu ficheiro 'CreateDreamPage.tsx', remova a importação do GoogleMap
//    e importe o LeafletMap:
//    import LeafletMap from '@/components/LeafletMap'; // ou o caminho correto
//
// 2. Substitua o componente <GoogleMap ... /> por este:
/*
<div className="h-[400px] rounded-md overflow-hidden">
  <LeafletMap
    center={{
      lat: formData.location_lat,
      lng: formData.location_lng,
    }}
    zoom={16}
    onLocationSelect={handleMapLocationSelect}
    markers={[
      {
        id: 'selected-location',
        position: {
          lat: formData.location_lat,
          lng: formData.location_lng,
        },
        title: 'Localização do Sonho',
      },
    ]}
    className="w-full h-full"
  />
</div>
*/
