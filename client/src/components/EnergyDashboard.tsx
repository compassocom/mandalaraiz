import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, Users } from 'lucide-react';

interface EnergyStatus {
  health_score: number;
  collaboration_wave: number;
  diversity_gauge: number;
  health_status: 'GREEN' | 'YELLOW' | 'RED';
}

interface EnergyDashboardProps {
  dreamId: number;
}

export const EnergyDashboard = ({ dreamId }: EnergyDashboardProps) => {
  const [energy, setEnergy] = useState<EnergyStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnergy = async () => {
      try {
        const response = await fetch(`/api/dreams/${dreamId}/energy`);
        if (!response.ok) {
          throw new Error('Failed to fetch energy status');
        }
        const energyData = await response.json();
        setEnergy(energyData);
      } catch (error) {
        console.error('Error fetching energy:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnergy();
  }, [dreamId]);

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'GREEN': return 'bg-green-500';
      case 'YELLOW': return 'bg-yellow-500';
      case 'RED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatScore = (score: number) => Math.round(score * 100);

  if (loading) {
    return <div className="text-center py-4">Loading energy dashboard...</div>;
  }

  if (!energy) {
    return <div className="text-center py-4 text-red-500">Failed to load energy data</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Activity className="mr-2 h-4 w-4" />
              Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{formatScore(energy.health_score)}%</div>
              <Badge className={getHealthColor(energy.health_status)}>
                {energy.health_status}
              </Badge>
            </div>
            <Progress value={formatScore(energy.health_score)} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              Collaboration Wave
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatScore(energy.collaboration_wave)}%</div>
            <Progress value={formatScore(energy.collaboration_wave)} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Recent activity rhythm
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Diversity Gauge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatScore(energy.diversity_gauge)}%</div>
            <Progress value={formatScore(energy.diversity_gauge)} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Participant variety
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Energy Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Overall Health:</span>
              <span className={`font-medium ${
                energy.health_status === 'GREEN' ? 'text-green-600' :
                energy.health_status === 'YELLOW' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {energy.health_status === 'GREEN' ? 'Thriving' :
                 energy.health_status === 'YELLOW' ? 'Needs Attention' :
                 'Critical'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Activity Level:</span>
              <span className="font-medium">
                {energy.collaboration_wave > 0.7 ? 'High' :
                 energy.collaboration_wave > 0.3 ? 'Moderate' : 'Low'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Team Diversity:</span>
              <span className="font-medium">
                {energy.diversity_gauge > 0.6 ? 'Excellent' :
                 energy.diversity_gauge > 0.3 ? 'Good' : 'Limited'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};