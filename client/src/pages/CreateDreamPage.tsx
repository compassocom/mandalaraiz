import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { GoogleMap } from '@/components/GoogleMap';
import { MapPin, ArrowLeft } from 'lucide-react';

export const CreateDreamPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    visibility_radius: 1000,
    location_lat: 0,
    location_lng: 0,
  });

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location_lat: position.coords.latitude,
            location_lng: position.coords.longitude,
          }));
          setShowMap(true);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Não foi possível obter sua localização. Por favor, ative os serviços de localização.');
        }
      );
    } else {
      alert('Geolocalização não é suportada por este navegador.');
    }
  };

  const handleMapLocationSelect = (location: { lat: number; lng: number }) => {
    setFormData(prev => ({
      ...prev,
      location_lat: location.lat,
      location_lng: location.lng,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // For demo purposes, using user_id = 1
      const dreamData = {
        ...formData,
        user_id: 1,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      };

      const response = await fetch('/api/dreams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dreamData),
      });

      if (!response.ok) {
        throw new Error('Failed to create dream');
      }

      const dream = await response.json();
      navigate(`/dream/${dream.id}`);
    } catch (error) {
      console.error('Error creating dream:', error);
      alert('Falha ao criar sonho. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Início
        </Button>
        <h1 className="text-3xl font-bold text-phase-dream">Criar um Sonho</h1>
        <p className="text-muted-foreground">
          Compartilhe sua visão com a comunidade
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-phase-dream">Detalhes do Sonho</CardTitle>
            <CardDescription>
              Descreva sua visão e defina parâmetros de descoberta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Sonho</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Qual é o seu sonho?"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva sua visão em detalhes..."
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="permacultura, educação, comunidade (separadas por vírgula)"
                />
              </div>

              <div className="space-y-4">
                <Label>Raio de Visibilidade: {formData.visibility_radius}m</Label>
                <Slider
                  value={[formData.visibility_radius]}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, visibility_radius: value[0] }))}
                  min={200}
                  max={2000}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>200m</span>
                  <span>2km</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Localização</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGetLocation}
                    className="w-full border-phase-act text-phase-act hover:phase-act hover:text-white"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Obter Localização Atual
                  </Button>
                </div>
                {formData.location_lat !== 0 && formData.location_lng !== 0 && (
                  <p className="text-sm text-muted-foreground">
                    Localização: {formData.location_lat.toFixed(6)}, {formData.location_lng.toFixed(6)}
                  </p>
                )}
              </div>

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || formData.location_lat === 0}
                  className="flex-1 phase-dream border-0"
                >
                  {isSubmitting ? 'Criando...' : 'Criar Sonho'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {showMap && formData.location_lat !== 0 && formData.location_lng !== 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-phase-act">Localização no Mapa</CardTitle>
              <CardDescription>
                Clique no mapa para ajustar a localização exata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] rounded-md overflow-hidden">
                <GoogleMap
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
                      phase: 'DREAM',
                    },
                  ]}
                  className="w-full h-full"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Raio de visibilidade: {formData.visibility_radius}m
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};