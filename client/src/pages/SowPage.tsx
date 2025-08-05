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
    currency: 'BRL',
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
          description: 'Cada R$ 1 vira 1 Semente apoiando diretamente este projeto',
          autopollination: 'Nenhuma'
        };
      case 'CATEGORY_POOL':
        return {
          rate: '1:1',
          description: 'Cada R$ 1 vira 1 Semente para projetos desta categoria',
          autopollination: '10% para o Banco de Sementes'
        };
      case 'GENERAL_SEEDBANK':
        return {
          rate: '1:0.8',
          description: 'Cada R$ 1 vira 0.8 Sementes para auto-polinização comunitária',
          autopollination: '20% para outros projetos'
        };
      default:
        return { rate: '1:1', description: '', autopollination: 'Nenhuma' };
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'DREAM': return 'bg-phase-dream';
      case 'PLAN': return 'bg-phase-plan';
      case 'ACT': return 'bg-phase-act';
      case 'CELEBRATE': return 'bg-phase-celebrate';
      default: return 'bg-gray-500';
    }
  };

  const getPhaseText = (phase: string) => {
    switch (phase) {
      case 'DREAM': return 'SONHAR';
      case 'PLAN': return 'PLANEJAR';
      case 'ACT': return 'AGIR';
      case 'CELEBRATE': return 'CELEBRAR';
      default: return phase;
    }
  };

  const handleDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!donationData.amount || !donationData.donor_name || !donationData.donor_email) {
      alert('Por favor, preencha todos os campos obrigatórios');
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

      alert(`Obrigado! Seus R$ ${donationData.amount} foram convertidos em ${donation.seeds_generated} Sementes.`);
      navigate('/');
    } catch (error) {
      console.error('Error processing donation:', error);
      alert('Falha ao processar doação. Por favor, tente novamente.');
    }
  };

  const conversionInfo = getConversionInfo();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando página de doação...</div>
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
          Voltar ao Início
        </Button>
        <h1 className="text-3xl font-bold mb-2 text-phase-celebrate">Plantar Sementes de Mudança</h1>
        <p className="text-muted-foreground">
          Transforme sua doação em energia regenerativa que faz crescer projetos comunitários
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {dream && (
            <Card className={`border-2 border-phase-${dream.phase.toLowerCase()}`}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="mr-2 h-5 w-5 text-red-500" />
                  Apoiando: {dream.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{dream.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {dream.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
                <Badge className={getPhaseColor(dream.phase)}>
                  {getPhaseText(dream.phase)}
                </Badge>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Tipo de Doação</CardTitle>
              <CardDescription>Escolha como sua energia flui</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div 
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    donationType === 'SPECIFIC_PROJECT' ? 'border-phase-dream bg-red-50' : 'border-border'
                  }`}
                  onClick={() => setDonationType('SPECIFIC_PROJECT')}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <input 
                      type="radio" 
                      checked={donationType === 'SPECIFIC_PROJECT'} 
                      onChange={() => setDonationType('SPECIFIC_PROJECT')}
                    />
                    <span className="font-medium">Direto ao Projeto</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Conversão 1:1 • Sem auto-polinização</p>
                </div>

                <div 
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    donationType === 'CATEGORY_POOL' ? 'border-phase-plan bg-yellow-50' : 'border-border'
                  }`}
                  onClick={() => setDonationType('CATEGORY_POOL')}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <input 
                      type="radio" 
                      checked={donationType === 'CATEGORY_POOL'} 
                      onChange={() => setDonationType('CATEGORY_POOL')}
                    />
                    <span className="font-medium">Pool da Categoria</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Conversão 1:1 • 10% para o Banco de Sementes</p>
                </div>

                <div 
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    donationType === 'GENERAL_SEEDBANK' ? 'border-phase-act bg-blue-50' : 'border-border'
                  }`}
                  onClick={() => setDonationType('GENERAL_SEEDBANK')}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <input 
                      type="radio" 
                      checked={donationType === 'GENERAL_SEEDBANK'} 
                      onChange={() => setDonationType('GENERAL_SEEDBANK')}
                    />
                    <span className="font-medium">Banco de Sementes Geral</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Conversão 1:0.8 • 20% auto-polinização</p>
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
                Conversão de Sementes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Taxa de Conversão:</span>
                  <span className="font-medium">{conversionInfo.rate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Auto-polinização:</span>
                  <span className="font-medium">{conversionInfo.autopollination}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {conversionInfo.description}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Doação</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDonation} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Valor (R$)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={donationData.amount}
                      onChange={(e) => setDonationData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="100.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Moeda</Label>
                    <select
                      id="currency"
                      value={donationData.currency}
                      onChange={(e) => setDonationData(prev => ({ ...prev, currency: e.target.value }))}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    >
                      <option value="BRL">Real (BRL)</option>
                      <option value="USD">Dólar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="donor_name">Seu Nome</Label>
                  <Input
                    id="donor_name"
                    value={donationData.donor_name}
                    onChange={(e) => setDonationData(prev => ({ ...prev, donor_name: e.target.value }))}
                    placeholder="Nome completo"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="donor_email">Seu Email</Label>
                  <Input
                    id="donor_email"
                    type="email"
                    value={donationData.donor_email}
                    onChange={(e) => setDonationData(prev => ({ ...prev, donor_email: e.target.value }))}
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message">Mensagem (opcional)</Label>
                  <textarea
                    id="message"
                    value={donationData.message}
                    onChange={(e) => setDonationData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Deixe uma mensagem de apoio..."
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>

                {donationData.amount && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <Zap className="mr-2 h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">
                        R$ {donationData.amount} = {(parseFloat(donationData.amount || '0') * parseFloat(conversionInfo.rate.split(':')[1]) / parseFloat(conversionInfo.rate.split(':')[0])).toFixed(1)} Sementes
                      </span>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full bg-phase-celebrate border-0">
                  <Heart className="mr-2 h-4 w-4" />
                  Plantar Sementes
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};