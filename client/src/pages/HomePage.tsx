import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Lightbulb, Coins, ShoppingBag, Globe, Zap, TrendingUp } from 'lucide-react';

export const HomePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-500 via-yellow-500 via-blue-500 to-green-500 bg-clip-text text-transparent">
          Mandala Raiz
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
          Plataforma geolocada de co-criação comunitária com economia regenerativa
        </p>
        
        {/* Phase Flow */}
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mb-8">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-phase-dream"></div>
            <span className="text-xs md:text-sm font-medium text-phase-dream">SONHAR</span>
          </div>
          <span className="text-muted-foreground hidden md:inline">→</span>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-phase-plan"></div>
            <span className="text-xs md:text-sm font-medium text-phase-plan">PLANEJAR</span>
          </div>
          <span className="text-muted-foreground hidden md:inline">→</span>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-phase-act"></div>
            <span className="text-xs md:text-sm font-medium text-phase-act">AGIR</span>
          </div>
          <span className="text-muted-foreground hidden md:inline">→</span>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-phase-celebrate"></div>
            <span className="text-xs md:text-sm font-medium text-phase-celebrate">CELEBRAR</span>
          </div>
        </div>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/create-dream">
            <Button size="lg" className="bg-phase-dream border-0 w-full sm:w-auto">
              <Lightbulb className="mr-2 h-4 w-4" />
              Iniciar um Sonho
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" size="lg" className="border-phase-act text-phase-act hover:bg-phase-act hover:text-white w-full sm:w-auto">
              <Users className="mr-2 h-4 w-4" />
              Explorar Sonhos
            </Button>
          </Link>
          <Link to="/marketplace">
            <Button variant="outline" size="lg" className="border-phase-celebrate text-phase-celebrate hover:bg-phase-celebrate hover:text-white w-full sm:w-auto">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Marketplace
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Features - 4 Columns on Desktop, Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
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
            <CardTitle className="text-phase-act">Economia Seeds & Roots</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Sistema de duas moedas: Seeds (participação) e Roots (valor real). 10% burn previne inflação.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-phase-celebrate">
          <CardHeader className="text-center">
            <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-phase-celebrate" />
            <CardTitle className="text-phase-celebrate">Marketplace</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Compre e venda produtos/serviços com Seeds. Sistema de reputação e localização integrados.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Token Economy Showcase */}
      <div className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Economia Regenerativa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Coins className="mr-2 h-5 w-5 text-green-600" />
                Seeds (Sementes)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ganha por participação</span>
                  <Badge variant="secondary">100/dia máx</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Burn em transações</span>
                  <Badge className="bg-orange-500">10%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Conversão para Roots</span>
                  <Badge className="bg-blue-500">100:1</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use para marketplace, apoio a projetos e conversão para Roots
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                Roots (Raízes)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Valor real garantido</span>
                  <Badge className="bg-green-500">1 Root = $0.01</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Saque mínimo</span>
                  <Badge variant="secondary">10,000 Roots</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Taxa de saque</span>
                  <Badge className="bg-orange-500">5%</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Moeda estável para valor real e saques em fiat
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5 text-blue-500" />
              Auto-Localização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Interface automática no seu idioma baseada na geolocalização. Suporte a 12+ idiomas.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="mr-2 h-5 w-5 text-yellow-500" />
              Anti-Farming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Limites diários, rate limiting e sistema de burn previnem farming e inflação descontrolada.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-purple-500" />
              Reputação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Sistema de avaliações para compradores e vendedores no marketplace com histórico transparente.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Como Funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-phase-dream rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h3 className="font-semibold text-phase-dream">Sonhar</h3>
                <p className="text-sm text-muted-foreground">Compartilhe sua visão com raio de visibilidade ajustável</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-phase-plan rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h3 className="font-semibold text-phase-plan">Planejar</h3>
                <p className="text-sm text-muted-foreground">Colabore em tarefas com limite de ativação de 3 pessoas</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-phase-act rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h3 className="font-semibold text-phase-act">Agir</h3>
                <p className="text-sm text-muted-foreground">Execute com painel de energia e economia de sementes</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-phase-celebrate rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <h3 className="font-semibold text-phase-celebrate">Celebrar</h3>
                <p className="text-sm text-muted-foreground">Compartilhe impacto e auto-polinize projetos próximos</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Coins className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="font-semibold">Ganhe Seeds</h3>
                <p className="text-sm text-muted-foreground">Participe ativamente: posts, comentários, tarefas</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <ShoppingBag className="h-6 w-6 text-blue-500 mt-1" />
              <div>
                <h3 className="font-semibold">Use no Marketplace</h3>
                <p className="text-sm text-muted-foreground">Compre/venda produtos e serviços locais</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <TrendingUp className="h-6 w-6 text-purple-500 mt-1" />
              <div>
                <h3 className="font-semibold">Converta para Roots</h3>
                <p className="text-sm text-muted-foreground">Transforme participação em valor real</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Globe className="h-6 w-6 text-orange-500 mt-1" />
              <div>
                <h3 className="font-semibold">Saque Real</h3>
                <p className="text-sm text-muted-foreground">Retire Roots como dinheiro real</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};