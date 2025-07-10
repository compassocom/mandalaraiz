import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Eye, Trash2, MapPin, Clock } from 'lucide-react';

export const PrivacyPage = () => {
  const navigate = useNavigate();

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
        <h1 className="text-3xl font-bold mb-2">Proteção de Dados Sagrados</h1>
        <p className="text-muted-foreground">
          Como protegemos suas informações com reverência e cuidado
        </p>
      </div>

      <div className="space-y-8">
        <Card className="border-phase-dream">
          <CardHeader>
            <CardTitle className="flex items-center text-phase-dream">
              <Eye className="mr-2 h-5 w-5" />
              O Que Coletamos
            </CardTitle>
            <CardDescription>
              Dados minimizados apenas para conectar sonhadores:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="font-medium">Localização (apenas raio aproximado)</h3>
                  <p className="text-sm text-muted-foreground">Convertemos sua localização GPS em células de grade de 1km² - nunca armazenamos coordenadas exatas.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-5 w-5 text-green-500 mt-0.5 flex items-center justify-center text-xs">🌱</div>
                <div>
                  <h3 className="font-medium">Habilidades (opcional)</h3>
                  <p className="text-sm text-muted-foreground">Como "Sou boa com plantas" - apenas para conectar complementaridades.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-5 w-5 text-yellow-500 mt-0.5 flex items-center justify-center text-xs">📈</div>
                <div>
                  <h3 className="font-medium">Histórico "Sementes Plantadas"</h3>
                  <p className="text-sm text-muted-foreground">Registro de contribuições para relatórios de impacto coletivo.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-phase-plan">
          <CardHeader>
            <CardTitle className="flex items-center text-phase-plan">
              <Shield className="mr-2 h-5 w-5" />
              Como Usamos
            </CardTitle>
            <CardDescription>
              Exclusivamente para:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="text-blue-500">→</div>
                <div>
                  <h3 className="font-medium">Conectar sonhadores próximos</h3>
                  <p className="text-sm text-muted-foreground">Encontrar pessoas com visões complementares em sua região.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-blue-500">→</div>
                <div>
                  <h3 className="font-medium">Gerar relatórios de impacto coletivo</h3>
                  <p className="text-sm text-muted-foreground">Mostrar como nossa comunidade está transformando o mundo.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-blue-500">→</div>
                <div>
                  <h3 className="font-medium">Melhorar a plataforma (com consentimento)</h3>
                  <p className="text-sm text-muted-foreground">Apenas mudanças aprovadas pela comunidade.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-phase-act">
          <CardHeader>
            <CardTitle className="flex items-center text-phase-act">
              <MapPin className="mr-2 h-5 w-5" />
              Proteções Especiais
            </CardTitle>
            <CardDescription>
              Salvaguardas extras para dados sensíveis:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Geolocalização:</h3>
                <p className="text-sm text-muted-foreground">
                  Dados GPS nunca são armazenados – convertidos imediatamente em células de grade de 1km² para proteção máxima.
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Tarefas (Karrabirts):</h3>
                <p className="text-sm text-muted-foreground">
                  Auto-deletadas após 1 ano de inatividade para prevenir acúmulo desnecessário de dados.
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Direito ao Esquecimento:</h3>
                <p className="text-sm text-muted-foreground">
                  Botão "Compostar estes dados" disponível a qualquer momento - exclusão completa em 24h.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-phase-celebrate">
          <CardHeader>
            <CardTitle className="flex items-center text-phase-celebrate">
              <Trash2 className="mr-2 h-5 w-5" />
              Parcerias & Terceiros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Acesso de terceiros a dados pessoais</span>
                <span className="text-green-600 font-bold">ZERO</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">IA Facilitadora</span>
                <span className="text-blue-600 font-medium">Modelos locais (sem nuvem)</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Rejeitamos completamente o capitalismo de vigilância. Suas habilidades e localização existem apenas para conectar sonhadores.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Política atualizada mensalmente com transparência total</span>
              </div>
              <div className="flex justify-center space-x-4">
                <Button variant="outline">
                  👁️ Ver Nossos Códigos de Segurança
                </Button>
                <Button variant="outline" className="phase-celebrate border-0">
                  🗑️ Compostar Meus Dados
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};