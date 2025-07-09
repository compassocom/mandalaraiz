import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, Coins, Zap } from 'lucide-react';

interface Dream {
  id: number;
  title: string;
  description: string;
  phase: 'DREAM' | 'PLAN' | 'ACT' | 'CELEBRATE';
  tags: string[];
}

export const SowPage = () => {
  const { linkId } = useParams<{ linkId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dream, setDream] = useState<Dream | null>(null);
  const [donationType, setDonationType] = useState<'SPECIFIC_PROJECT' | 'CATEGORY_POOL' | 'GENERAL_SEEDBANK'>('SPECIFIC_PROJECT');
  const [donationData, setDonationData] = useState({
    amount: '',
    currency: 'USD',
    donor_name: '',
    donor_email: '',
    message: ''
  });

  useEffect(() => {
    fetchDonationTarget();
  }, [linkId]);

  const fetchDonationTarget = async () => {
    try {
      // In a real app, would fetch donation link details
      // For demo, assume it's for dream ID 1
      const response = await fetch('/api/dreams/1');
      if (response.ok) {
        const dreamData = await response.json();
        setDream(dreamData);
      }
    } catch (error) {
      console.error('Error fetching donation target:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConversionInfo = () => {
    switch (donationType) {
      case 'SPECIFIC_PROJECT':
        return {
          rate: '1:1',
          description: 'Every $1 becomes 1 Seed directly supporting this project',
          autopollination: 'None'
        };
      case 'CATEGORY_POOL':
        return {
          rate: '1:1',
          description: 'Every $1 becomes 1 Seed for projects in this category',
          autopollination: '10% to SeedBank'
        };
      case 'GENERAL_SEEDBANK':
        return {
          rate: '1:0.8',
          description: 'Every $1 becomes 0.8 Seeds for community auto-pollination',
          autopollination: '20% to other projects'
        };
      default:
        return { rate: '1:1', description: '', autopollination: 'None' };
    }
  };

  const handleDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!donationData.amount || !donationData.donor_name || !donationData.donor_email) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Register donor
      const donorResponse = await fetch('/api/donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: donationData.donor_email,
          name: donationData.donor_name,
          preferred_currency: donationData.currency
        })
      });

      if (!donorResponse.ok) throw new Error('Failed to register donor');
      const donor = await donorResponse.json();

      // Process donation
      const donationResponse = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: donor.id,
          amount: parseFloat(donationData.amount),
          currency: donationData.currency,
          donation_type: donationType,
          target_dream_id: dream?.id,
          donor_message: donationData.message,
          payment_reference: `demo_${Date.now()}`
        })
      });

      if (!donationResponse.ok) throw new Error('Failed to process donation');
      const donation = await donationResponse.json();

      alert(`Thank you! Your $${donationData.amount} has been converted to ${donation.seeds_generated} Seeds.`);
      navigate('/');
    } catch (error) {
      console.error('Error processing donation:', error);
      alert('Failed to process donation. Please try again.');
    }
  };

  const conversionInfo = getConversionInfo();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading donation page...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <h1 className="text-3xl font-bold mb-2">Plant Seeds of Change</h1>
        <p className="text-muted-foreground">
          Transform your donation into regenerative energy that grows community projects
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {dream && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="mr-2 h-5 w-5 text-red-500" />
                  Supporting: {dream.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{dream.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {dream.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
                <Badge className="bg-blue-500">{dream.phase}</Badge>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Donation Type</CardTitle>
              <CardDescription>Choose how your energy flows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div 
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    donationType === 'SPECIFIC_PROJECT' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => setDonationType('SPECIFIC_PROJECT')}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <input 
                      type="radio" 
                      checked={donationType === 'SPECIFIC_PROJECT'} 
                      onChange={() => setDonationType('SPECIFIC_PROJECT')}
                    />
                    <span className="font-medium">Direct to Project</span>
                  </div>
                  <p className="text-sm text-muted-foreground">1:1 conversion • No auto-pollination</p>
                </div>

                <div 
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    donationType === 'CATEGORY_POOL' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => setDonationType('CATEGORY_POOL')}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <input 
                      type="radio" 
                      checked={donationType === 'CATEGORY_POOL'} 
                      onChange={() => setDonationType('CATEGORY_POOL')}
                    />
                    <span className="font-medium">Category Pool</span>
                  </div>
                  <p className="text-sm text-muted-foreground">1:1 conversion • 10% to SeedBank</p>
                </div>

                <div 
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    donationType === 'GENERAL_SEEDBANK' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => setDonationType('GENERAL_SEEDBANK')}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <input 
                      type="radio" 
                      checked={donationType === 'GENERAL_SEEDBANK'} 
                      onChange={() => setDonationType('GENERAL_SEEDBANK')}
                    />
                    <span className="font-medium">General SeedBank</span>
                  </div>
                  <p className="text-sm text-muted-foreground">1:0.8 conversion • 20% auto-pollination</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Coins className="mr-2 h-5 w-5 text-yellow-500" />
                Seed Conversion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Conversion Rate:</span>
                  <span className="font-medium">{conv