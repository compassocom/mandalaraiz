import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GoogleMap } from '@/components/GoogleMap';
import { ArrowLeft, MapPin, Users, Plus, Map, AlertCircle } from 'lucide-react';

interface Dream {
  id: number;
  title: string;
  description: string;
  location_lat: number;
  location_lng: number;
  visibility_radius: number;
  phase: 'DREAM' | 'PLAN' | 'ACT' | 'CELEBRATE';
  participant_limit: number;
  is_active: boolean;
}

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  useEffect(() => {
    // Get user location first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setLocationError(null);
          fetchNearbyDreams(location.lat, location.lng);
        },
        (error) => {
          console.log('Error getting location:', error);
          let errorMessage = 'Não foi possível obter sua localização';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permissão de localização negada. Ative a localização para descobrir sonhos próximos.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Localização indisponível no momento.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Timeout ao obter localização.';
              break;
          }
          
          setLocationError(errorMessage);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      setLocationError('Geolocalização não é suportada pelo seu navegador');
      setLoading(false);
    }
  }, []);

  const fetchNearbyDreams = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`/api/dreams/nearby?lat=${lat}&lng=${lng}&radius=2000`);
      if (!response.ok) {
        throw new Error('Failed to fetch dreams');
      }
      const dreamsData = await response.json();
      setDreams(dreamsData);
    } catch (error) {
      console.error('Error fetching dreams:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'DREAM': return 'bg-phase-dream';
      case 'PLAN': return 'bg-phase-plan';
      case 'ACT': return 'bg-phase-act';
      case 'CELEBRATE': return 'bg-phase-celebrate';
      default: return 'bg-gray-500';
    }
  };

  const getPhaseText = (phase: string) => {
    switch (phase) {
      case 'DREAM': return 'SONHAR';
      case 'PLAN': return 'PLANEJAR';
      case 'ACT': return 'AGIR';
      case 'CELEBRATE': return 'CELEBRAR';
      default: return phase;
    }
  };

  const getPhaseBorderClass = (phase: string) => {
    switch (phase) {
      case 'DREAM': return 'border-phase-dream';
      case 'PLAN': return 'border-phase-plan';
      case 'ACT': return 'border-phase-act';
      case 'CELEBRATE': return 'border-phase-celebrate';
      default: return 'border-gray-500';
    }
  };

  const getPhaseTextClass = (phase: string) => {
    switch (phase) {
      case 'DREAM': return 'text-phase-dream';
      case 'PLAN': return 'text-phase-plan';
      case 'ACT': return 'text-phase-act';
      case 'CELEBRATE': return 'text-phase-celebrate';
      default: return 'text-gray-500';
    }
  };

  const getPhaseHoverClass = (phase: string) => {
    switch (phase) {
      case 'DREAM': return 'hover:bg-phase-dream';
      case 'PLAN': return 'hover:bg-phase-plan';
      case 'ACT': return 'hover:bg-phase-act';
      case 'CELEBRATE': return 'hover:bg-phase-celebrate';
      default: return 'hover:bg-gray-500';
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando sonhos...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Início
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Painel de Sonhos</h1>
            <p className="text-muted-foreground">
              {userLocation ? `Mostrando sonhos em um raio de 2km da sua localização` : 'Ative a localização para ver sonhos próximos'}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
              size="sm"
            >
              <Users className="mr-2 h-4 w-4" />
              Grade
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              onClick={() => setViewMode('map')}
              size="sm"
              disabled={!userLocation}
            >
              <Map className="mr-2 h-4 w-4" />
              Mapa
            </Button>
            <Link to="/create-dream">
              <Button className="bg-phase-dream border-0">
                <Plus className="mr-2 h-4 w-4" />
                Criar Sonho
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Location Error Alert */}
      {locationError && (
        <Card className="mb-6 border-yellow-400">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-700">
              <AlertCircle className="mr-2 h-5 w-5" />
              Problema de Localização
            </CardTitle>
            <CardDescription>{locationError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="mr-2"
            >
              Tentar Novamente
            </Button>
            <span className="text-sm text-muted-foreground">
              Ative a localização para descobrir sonhos próximos
            </span>
          </CardContent>
        </Card>
      )}

      {viewMode === 'map' && userLocation && dreams.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Mapa de Sonhos</CardTitle>
            <CardDescription>
              Visualize todos os sonhos próximos no mapa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] rounded-md overflow-hidden">
              <GoogleMap
                center={userLocation}
                zoom={13}
                markers={dreams.map(dream => ({
                  id: dream.id.toString(),
                  position: {
                    lat: dream.location_lat,
                    lng: dream.location_lng,
                  },
                  title: dream.title,
                  phase: dream.phase,
                  onClick: () => navigate(`/dream/${dream.id}`),
                }))}
                className="w-full h-full"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'grid' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dreams.map((dream) => (
            <Card key={dream.id} className={`cursor-pointer hover:shadow-lg transition-shadow border-2 ${getPhaseBorderClass(dream.phase)}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{dream.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getPhaseColor(dream.phase)}>
                        {getPhaseText(dream.phase)}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-1 h-3 w-3" />
                        {userLocation && (
                          <span>
                            {calculateDistance(
                              userLocation.lat,
                              userLocation.lng,
                              dream.location_lat,
                              dream.location_lng
                            ).toFixed(1)}km de distância
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {dream.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-1 h-3 w-3" />
                    <span>Até {dream.participant_limit} participantes</span>
                  </div>
                  <Link to={`/dream/${dream.id}`}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`${getPhaseBorderClass(dream.phase)} ${getPhaseTextClass(dream.phase)} ${getPhaseHoverClass(dream.phase)} hover:text-white`}
                    >
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {dreams.length === 0 && userLocation && (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum Sonho Encontrado</CardTitle>
            <CardDescription>
              Nenhum sonho encontrado na sua área. Seja o primeiro a criar um!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/create-dream">
              <Button className="bg-phase-dream border-0">
                <Plus className="mr-2 h-4 w-4" />
                Criar o Primeiro Sonho
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {!userLocation && !locationError && (
        <Card>
          <CardHeader>
            <CardTitle>Aguardando Localização</CardTitle>
            <CardDescription>
              Obtendo sua localização para mostrar sonhos próximos...
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};
