import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Users, Plus } from 'lucide-react';

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
          fetchNearbyDreams(location.lat, location.lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoading(false);
        }
      );
    } else {
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
      case 'DREAM': return 'bg-blue-500';
      case 'PLAN': return 'bg-yellow-500';
      case 'ACT': return 'bg-green-500';
      case 'CELEBRATE': return 'bg-purple-500';
      default: return 'bg-gray-500';
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
        <div className="text-center">Loading dreams...</div>
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
          Back to Home
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dream Dashboard</h1>
            <p className="text-muted-foreground">
              {userLocation ? `Showing dreams within 2km of your location` : 'Enable location to see nearby dreams'}
            </p>
          </div>
          <Link to="/create-dream">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Dream
            </Button>
          </Link>
        </div>
      </div>

      {!userLocation && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Location Required</CardTitle>
            <CardDescription>
              Please enable location services to discover nearby dreams
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dreams.map((dream) => (
          <Card key={dream.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{dream.title}</CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={getPhaseColor(dream.phase)}>
                      {dream.phase}
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
                          ).toFixed(1)}km away
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
                  <span>Up to {dream.participant_limit} participants</span>
                </div>
                <Link to={`/dream/${dream.id}`}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {dreams.length === 0 && userLocation && (
        <Card>
          <CardHeader>
            <CardTitle>No Dreams Found</CardTitle>
            <CardDescription>
              No dreams found in your area. Be the first to create one!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/create-dream">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create the First Dream
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};