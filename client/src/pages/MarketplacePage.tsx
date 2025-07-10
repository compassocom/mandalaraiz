import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Search, MapPin, Star, ShoppingBag, Filter } from 'lucide-react';

interface MarketplaceListing {
  id: number;
  title: string;
  description: string;
  price_seeds: number;
  category: string;
  location_text: string | null;
  images: string | null;
  view_count: number;
  seller_name: string;
  seller_rating: number | null;
  seller_reviews_count: number | null;
  created_at: string;
}

export const MarketplacePage = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    price_seeds: '',
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
    fetchListings();
  }, [searchTerm, selectedCategory]);

  const fetchListings = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (selectedCategory) params.set('category', selectedCategory);
      
      const response = await fetch(`/api/marketplace/listings?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      const data = await response.json();
      setListings(data.listings);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const createListing = async () => {
    try {
      const response = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newListing,
          price_seeds: parseFloat(newListing.price_seeds),
          seller_id: 1, // Demo user ID
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create listing');
      }

      const listing = await response.json();
      setListings(prev => [listing, ...prev]);
      setNewListing({
        title: '',
        description: '',
        price_seeds: '',
        category: 'PRODUCT',
        subcategory: '',
        location_text: '',
      });
      setShowCreateDialog(false);
      alert('Listing created successfully! It will be visible after approval.');
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Failed to create listing. Please try again.');
    }
  };

  const handlePurchase = async (listingId: number, priceSeeds: number) => {
    if (!confirm(`Purchase this item for ${priceSeeds} Seeds?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/marketplace/purchase/${listingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyer_id: 1, // Demo user ID
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to purchase item');
      }

      const result = await response.json();
      alert('Purchase successful!');
      fetchListings(); // Refresh listings
    } catch (error) {
      console.error('Error purchasing item:', error);
      alert(error.message || 'Failed to purchase item. Please try again.');
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
              Compre e venda produtos/serviços com Seeds
            </p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="phase-celebrate border-0">
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="listing-price">Preço (Seeds)</Label>
                    <Input
                      id="listing-price"
                      type="number"
                      value={newListing.price_seeds}
                      onChange={(e) => setNewListing(prev => ({ ...prev, price_seeds: e.target.value }))}
                      placeholder="100"
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
                  <Button onClick={createListing} disabled={!newListing.title || !newListing.description || !newListing.price_seeds}>
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

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <Button variant="outline" className="justify-start">
          <Filter className="mr-2 h-4 w-4" />
          Filtros Avançados
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
                {/* Price */}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">
                    {listing.price_seeds} Seeds
                  </span>
                </div>

                {/* Seller Info */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{listing.seller_name}</span>
                  {listing.seller_rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-muted-foreground">
                        {listing.seller_rating.toFixed(1)} ({listing.seller_reviews_count})
                      </span>
                    </div>
                  )}
                </div>

                {/* Location */}
                {listing.location_text && (
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{listing.location_text}</span>
                  </div>
                )}

                {/* Purchase Button */}
                <Button 
                  className="w-full phase-act border-0"
                  onClick={() => handlePurchase(listing.id, listing.price_seeds)}
                >
                  Comprar com Seeds
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {listings.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum item encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory 
                ? 'Tente ajustar seus filtros de busca' 
                : 'Seja o primeiro a criar um anúncio!'}
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="phase-celebrate border-0">
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Anúncio
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
