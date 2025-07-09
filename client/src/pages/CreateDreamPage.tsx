import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { MapPin, ArrowLeft } from 'lucide-react';

export const CreateDreamPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
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
      alert('Failed to create dream. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <h1 className="text-3xl font-bold">Create a Dream</h1>
        <p className="text-muted-foreground">
          Share your vision with the community
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dream Details</CardTitle>
          <CardDescription>
            Describe your vision and set discovery parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Dream Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="What's your dream?"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your vision in detail..."
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
                placeholder="permaculture, education, community (comma-separated)"
              />
            </div>

            <div className="space-y-4">
              <Label>Visibility Radius: {formData.visibility_radius}m</Label>
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
              <Label>Location</Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGetLocation}
                  className="w-full"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Get Current Location
                </Button>
              </div>
              {formData.location_lat !== 0 && formData.location_lng !== 0 && (
                <p className="text-sm text-muted-foreground">
                  Location: {formData.location_lat.toFixed(6)}, {formData.location_lng.toFixed(6)}
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
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || formData.location_lat === 0}
                className="flex-1"
              >
                {isSubmitting ? 'Creating...' : 'Create Dream'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};