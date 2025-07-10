import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Users, Lightbulb, Coins } from 'lucide-react';

export const HomePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-500 via-yellow-500 via-blue-500 to-green-500 bg-clip-text text-transparent">
          Mandala Raiz
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          Plataforma geolocada de co-criação comunitária
        </p>
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full phase-dream"></div>
            <span className="text-sm font-medium text-phase-dream">SONHAR</span>
          </div>
          <span className="text-muted-foreground">→</span>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full phase-plan"></div>
            <span className="text-sm font-medium text-phase-plan">PLANEJAR</span>
          </div>
          <span className="text-muted-foreground">→</span>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full phase-act"></div>
            <span className="text-sm font-medium text-phase-act">AGIR</span>
          </div>
          <span className="text-muted-foreground">→</span>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full phase-celebrate"></div>
            <span className="text-sm font-medium text-phase-celebrate">CELEBRAR</span>
          </div>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Link to="/create-dream">
            <Button size="lg" className="phase-dream border-0">
              <Lightbulb className="mr-2 h-4 w-4" />
              Iniciar um Sonho
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" size="lg" className="border-phase-act text-phase-act hover:phase-act hover:text-white">
              <Users className="mr-2 h-4 w-4" />
              Explorar Sonhos
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="border-phase-dream">
          <CardHeader className="text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-phase-dream" />
            <CardTitle className="text-phase-dream">Baseado em Localização</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Descubra sonhos em um raio de 200m-2km. Conecte-se com vizinhos trabalhando em visões similares.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-phase-plan">
          <CardHeader className="text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-phase-plan" />
            <CardTitle className="text-phase-plan">Colaborativo</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Limite de ativação de 3 pessoas. Colaboração radical sobre competição com compartilhamento de tarefas.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-phase-act">
          <CardHeader className="text-center">
            <Coins className="h-8 w-8 mx-auto mb-2 text-phase-act" />
            <CardTitle className="text-phase-act">Economia Sementes</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Moeda regenerativa com 10% de auto-polinização para projetos próximos. Sem monetização tradicional.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-phase-celebrate">
          <CardHeader className="text-center">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 text-phase-celebrate" />
            <CardTitle className="text-phase-celebrate">Ciclo de 4 Fases</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Jornada estruturada do Sonho através do Planejamento e Ação até a Celebração. Tecnologia como facilitadora humilde.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Como Funciona</h2>
        <div className="space-y-4 text-left">
          <div className="flex items-start space-x-3">
            <div className="phase-dream rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <h3 className="font-semibold text-phase-dream">Sonhar</h3>
              <p className="text-sm text-muted-foreground">Compartilhe sua visão com raio de visibilidade ajustável</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="phase-plan rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <h3 className="font-semibold text-phase-plan">Planejar</h3>
              <p className="text-sm text-muted-foreground">Colabore em tarefas com limite de ativação de 3 pessoas</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="phase-act rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</div>
            <div>
              <h3 className="font-semibold text-phase-act">Agir</h3>
              <p className="text-sm text-muted-foreground">Execute com painel de energia e economia de sementes</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="phase-celebrate rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</div>
            <div>
              <h3 className="font-semibold text-phase-celebrate">Celebrar</h3>
              <p className="text-sm text-muted-foreground">Compartilhe impacto e auto-polinize projetos próximos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};