import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Users, Lightbulb, Coins } from 'lucide-react';

export const HomePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Karrabirt</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Geolocated community co-creation platform
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          DREAM → PLAN → ACT → CELEBRATE
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link to="/create-dream">
            <Button size="lg">
              <Lightbulb className="mr-2 h-4 w-4" />
              Start a Dream
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" size="lg">
              <Users className="mr-2 h-4 w-4" />
              Explore Dreams
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card>
          <CardHeader className="text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
            <CardTitle>Location-Based</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Discover dreams within 200m-2km radius. Connect with neighbors working on similar visions.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <CardTitle>Collaborative</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              3-person activation threshold. Radical collaboration over competition with task sharing.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Coins className="h-8 w-8 mx-auto mb-2 text-primary" />
            <CardTitle>Seed Economy</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Regenerative currency with 10% auto-pollination to nearby projects. No traditional monetization.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 text-primary" />
            <CardTitle>4-Phase Cycle</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Structured journey from Dream through Plan and Act to Celebrate. Technology as humble facilitator.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
        <div className="space-y-4 text-left">
          <div className="flex items-start space-x-3">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <h3 className="font-semibold">Dream</h3>
              <p className="text-sm text-muted-foreground">Share your vision with adjustable visibility radius</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <h3 className="font-semibold">Plan</h3>
              <p className="text-sm text-muted-foreground">Collaborate on tasks with 3-person activation threshold</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
            <div>
              <h3 className="font-semibold">Act</h3>
              <p className="text-sm text-muted-foreground">Execute with energy dashboard and seed economy</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
            <div>
              <h3 className="font-semibold">Celebrate</h3>
              <p className="text-sm text-muted-foreground">Share impact and auto-pollinate nearby projects</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};