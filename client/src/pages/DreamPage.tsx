import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Users, Activity, Coins } from 'lucide-react';
import { EnergyDashboard } from '@/components/EnergyDashboard';
import { TaskList } from '@/components/TaskList';
import { SeedWallet } from '@/components/SeedWallet';

interface Dream {
  id: number;
  title: string;
  description: string;
  location_lat: number;
  location_lng: number;
  visibility_radius: number;
  phase: 'DREAM' | 'PLAN' | 'ACT' | 'CELEBRATE';
  participant_limit: number;
  tags: string[];
  participants: Array<{
    id: number;
    name: string;
    email: string;
    joined_at: string;
  }>;
}

export const DreamPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dream, setDream] = useState<Dream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDream = async () => {
      try {
        const response = await fetch(`/api/dreams/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch dream');
        }
        const dreamData = await response.json();
        setDream(dreamData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDream();
    }
  }, [id]);

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'DREAM': return 'bg-blue-500';
      case 'PLAN': return 'bg-yellow-500';
      case 'ACT': return 'bg-green-500';
      case 'CELEBRATE': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading dream...</div>
      </div>
    );
  }

  if (error || !dream) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          Error: {error || 'Dream not found'}
        </div>
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
            <h1 className="text-3xl font-bold">{dream.title}</h1>
            <div className="flex items-center space-x-4 mt-2 text-muted-foreground">
              <div className="flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                <span>{dream.visibility_radius}m radius</span>
              </div>
              <div className="flex items-center">
                <Users className="mr-1 h-4 w-4" />
                <span>{dream.participants.length}/{dream.participant_limit} participants</span>
              </div>
            </div>
          </div>
          <Badge className={getPhaseColor(dream.phase)}>
            {dream.phase}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{dream.description}</p>
              
              {dream.tags.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {dream.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Energy Dashboard
              </CardTitle>
              <CardDescription>
                Real-time health and collaboration metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnergyDashboard dreamId={dream.id} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>
                Collaborative task management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaskList dreamId={dream.id} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dream.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div>
                      <div className="font-medium">{participant.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Joined {new Date(participant.joined_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {dream.participants.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No participants yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Coins className="mr-2 h-5 w-5" />
                Seed Wallet
              </CardTitle>
              <CardDescription>
                Regenerative currency system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SeedWallet userId={1} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};