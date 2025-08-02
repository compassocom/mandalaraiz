import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Search, MapPin, Star, ShoppingBag, Filter, AlertCircle } from 'lucide-react';

interface MarketplaceListing {
  id: number;
  title: string;
  description: string;
  category: string;
  location_text: string | null;
  location_lat: number | null;
  location_lng: number | null;
  images: string | null;
  view_count: number;
  seller_name: string;
  created_at: string;
  distance?: number;
}

export const MarketplacePage = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [maxDistance, setMaxDistance] = useState(10); // km
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    category: 'PRODUCT' as const,
    subcategory: '',
    location_text: '',
  });

  const categories = [
    { value: '', label: 'Todas as Categorias' },
    { value: 'PRODUCT', label: 'Produtos' },
    { value: 'SERVICE', label: 'Serviços' },
    { value: 'DIGITAL', label: 'Digital' },
    { value: 'OTHER', label: 'Outros' }
  ];

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
          fetchListings(location);
        },
        (error) => {
          console.log('Error getting location:', error);
          let errorMessage = 'Não foi possível obter sua localização';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permissão de localização negada. Ative a localização para ver itens próximos.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Localização indisponível no momento.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Timeout ao obter localização.';
              break;
          }
          
          setLocationError(errorMessage);
          fetchListings();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      setLocationError('Geolocalização não é suportada pelo seu navegador');
      fetchListings();
    }
  }, [searchTerm, selectedCategory, maxDistance]);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const fetchListings = async (location?: { lat: number; lng: number }) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (selectedCategory) params.set('category', selectedCategory);
      
      const response = await fetch(`/api/marketplace/listings?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch listings: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      
      // Calculate distances and filter by maxDistance if user location is available
      let processedListings = data.listings || [];
      
      if (location) {
        processedListings = data.listings
          .map((listing: MarketplaceListing) => {
            if (listing.location_lat && listing.location_lng) {
              const distance = calculateDistance(
                location.lat,
                location.lng,
                listing.location_lat,
                listing.location_lng
              );
              return { ...listing, distance };
            }
            return { ...listing, distance: null };
          })
          .filter((listing: MarketplaceListing) => 
            listing.distance === null || listing.distance <= maxDistance
          )
          .sort((a: MarketplaceListing, b: MarketplaceListing) => {
            // Sort by distance (closest first), then by date
            if (a.distance === null && b.distance === null) return 0;
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
          });
      }
      
      setListings(processedListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
      console.log('Failed to fetch listings', error);
      setListings([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const createListing = async () => {
    try {
      let listingData = {
        ...newListing,
        seller_id: 1, // Demo user ID
        location_lat: null as number | null,
        location_lng: null as number | null,
      };

      // Add user location if available
      if (userLocation) {
        listingData.location_lat = userLocation.lat;
        listingData.location_lng = userLocation.lng;
      }

      const response = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(listingData),
      });

      if (!response.ok) {
        throw new Error('Failed to create listing');
      }

      const listing = await response.json();
      setListings(prev => [listing, ...prev]);
      setNewListing({
        title: '',
        description: '',
        category: 'PRODUCT',
        subcategory: '',
        location_text: '',
      });
      setShowCreateDialog(false);
      alert('Anúncio criado com sucesso!');
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Falha ao criar anúncio. Tente novamente.');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'PRODUCT': return 'bg-blue-500';
      case 'SERVICE': return 'bg-green-500';
      case 'DIGITAL': return 'bg-purple-500';
      case 'OTHER': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'PRODUCT': return 'Produto';
      case 'SERVICE': return 'Serviço';
      case 'DIGITAL': return 'Digital';
      case 'OTHER': return 'Outro';
      default: return category;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando marketplace...</div>
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
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <ShoppingBag className="mr-2 h-8 w-8 text-phase-celebrate" />
              Marketplace
            </h1>
            <p className="text-muted-foreground">
              {userLocation 
                ? `Itens em um raio de ${maxDistance}km da sua localização`
                : 'Produtos e serviços da comunidade'
              }
            </p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-phase-celebrate border-0">
                <Plus className="mr-2 h-4 w-4" />
                Criar Anúncio
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Anúncio</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="listing-title">Título</Label>
                  <Input
                    id="listing-title"
                    value={newListing.title}
                    onChange={(e) => setNewListing(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título do item"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="listing-description">Descrição</Label>
                  <textarea
                    id="listing-description"
                    value={newListing.description}
                    onChange={(e) => setNewListing(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva seu item"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="listing-category">Categoria</Label>
                  <select
                    id="listing-category"
                    value={newListing.category}
                    onChange={(e) => setNewListing(prev => ({ ...prev, category: e.target.value as any }))}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="PRODUCT">Produto</option>
                    <option value="SERVICE">Serviço</option>
                    <option value="DIGITAL">Digital</option>
                    <option value="OTHER">Outro</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="listing-location">Localização (opcional)</Label>
                  <Input
                    id="listing-location"
                    value={newListing.location_text}
                    onChange={(e) => setNewListing(prev => ({ ...prev, location_text: e.target.value }))}
                    placeholder="Sua cidade, bairro..."
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={createListing} disabled={!newListing.title || !newListing.description}>
                    Criar Anúncio
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
              Você ainda pode ver todos os anúncios disponíveis
            </span>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar produtos e serviços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        {userLocation && (
          <div>
            <Label className="text-xs">Distância máxima: {maxDistance}km</Label>
            <Input
              type="range"
              min="1"
              max="50"
              value={maxDistance}
              onChange={(e) => setMaxDistance(parseInt(e.target.value))}
              className="mt-1"
            />
          </div>
        )}
        <Button variant="outline" className="justify-start">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listings.map((listing) => (
          <Card key={listing.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{listing.title}</CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={getCategoryColor(listing.category)}>
                      {getCategoryText(listing.category)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {listing.view_count} visualizações
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                {listing.description}
              </p>
              
              <div className="space-y-3">
                {/* Seller Info */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{listing.seller_name || 'Vendedor'}</span>
                </div>

                {/* Location & Distance */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{listing.location_text || 'Localização não informada'}</span>
                  </div>
                  {listing.distance !== undefined && listing.distance !== null && (
                    <span className="font-medium">
                      {listing.distance.toFixed(1)}km
                    </span>
                  )}
                </div>

                {/* Contact Button */}
                <Button 
                  className="w-full bg-phase-act border-0"
                  onClick={() => alert('Funcionalidade de contato em desenvolvimento')}
                >
                  Entrar em Contato
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {listings.length === 0 && !loading && (
        <Card className="text-center py-12">
          <CardContent>
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum item encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory 
                ? 'Tente ajustar seus filtros de busca' 
                : userLocation 
                  ? `Nenhum item encontrado em um raio de ${maxDistance}km`
                  : 'Seja o primeiro a criar um anúncio!'
              }
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-phase-celebrate border-0">
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Anúncio
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};