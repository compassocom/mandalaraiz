import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- INSTRUÇÕES DE INSTALAÇÃO ---
// Para que este código funcione, você precisa de instalar as seguintes dependências
// no terminal do seu projeto. O erro "ERESOLVE" acontece porque a versão
// mais recente do react-leaflet não é compatível com a versão do React do seu projeto.
//
// Execute os seguintes comandos no seu terminal:
//
// npm install leaflet react-leaflet@^4.2.1
// npm install -D @types/leaflet
//
// --- FIM DAS INSTRUÇÕES ---


// --- Correção para o ícone do marcador ---
// O react-leaflet por vezes não encontra o ícone padrão.
// Este código importa os ícones diretamente e corrige o problema.
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;
// --- Fim da correção do ícone ---


// Componente principal do mapa
function LeafletMap() {
  // Posição inicial do mapa (Ex: Recife, Pernambuco)
  const position = [-8.047562, -34.877026];

  return (
    <MapContainer 
      center={position} 
      zoom={13} 
      scrollWheelZoom={false} 
      style={{ height: '500px', width: '100%' }}
    >
      {/* Camada de mapa do OpenStreetMap */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Marcador de exemplo */}
      <Marker position={position}>
        <Popup>
          Mandala Raiz. <br /> Um novo sonho começa aqui!
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default LeafletMap;

// --- Como usar este componente ---
// 1. Instale as dependências necessárias no seu projeto:
//    npm install leaflet react-leaflet@^4.2.1
//    npm install -D @types/leaflet
//
// 2. Importe este componente noutra página:
//    import LeafletMap from './LeafletMap';
//
// 3. Use-o no seu JSX:
//    <LeafletMap />

