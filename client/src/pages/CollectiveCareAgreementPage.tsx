import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Heart, Shield, Users, Sprout } from 'lucide-react';

export const CollectiveCareAgreementPage = () => {
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
        <h1 className="text-3xl font-bold mb-2">Acordo de Cuidado Coletivo</h1>
        <p className="text-muted-foreground">
          Nossos princípios éticos baseados na metodologia Dragon Dreaming
        </p>
      </div>

      <div className="space-y-8">
        <Card className="border-phase-dream">
          <CardHeader>
            <CardTitle className="flex items-center text-phase-dream">
              <Heart className="mr-2 h-5 w-5" />
              Você é um Guardião
            </CardTitle>
            <CardDescription>
              Quando criar um sonho, você se compromete a:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="text-green-500 text-lg">✓</div>
                <div>
                  <h3 className="font-medium">Escutar todas as vozes</h3>
                  <p className="text-sm text-muted-foreground">Garantir que cada participante seja ouvido e valorizado no processo colaborativo.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-green-500 text-lg">✓</div>
                <div>
                  <h3 className="font-medium">Celebrar erros como aprendizados</h3>
                  <p className="text-sm text-muted-foreground">Transformar fracassos em oportunidades de crescimento coletivo.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-green-500 text-lg">✓</div>
                <div>
                  <h3 className="font-medium">Respeitar o "Limite Participativo"</h3>
                  <p className="text-sm text-muted-foreground">Honrar os limites de capacidade estabelecidos para cada sonho.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-phase-plan">
          <CardHeader>
            <CardTitle className="flex items-center text-phase-plan">
              <Sprout className="mr-2 h-5 w-5" />
              Economia Regenerativa
            </CardTitle>
            <CardDescription>
              A Moeda Sementes é:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="text-blue-500">→</div>
                <div>
                  <h3 className="font-medium">Não conversível em dinheiro</h3>
                  <p className="text-sm text-muted-foreground">Sementes existem apenas para nutrir outros sonhos, não para acúmulo financeiro.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-blue-500">→</div>
                <div>
                  <h3 className="font-medium">Não acumulável (expira em 12 meses)</h3>
                  <p className="text-sm text-muted-foreground">Promove fluxo contínuo de energia e previne concentração de recursos.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-blue-500">→</div>
                <div>
                  <h3 className="font-medium">Apenas utilizável dentro da plataforma</h3>
                  <p className="text-sm text-muted-foreground">Mantém o valor circulando no ecossistema regenerativo.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-phase-act">
          <CardHeader>
            <CardTitle className="flex items-center text-phase-act">
              <Shield className="mr-2 h-5 w-5" />
              Remoção de Projetos
            </CardTitle>
            <CardDescription>
              Razões definidas pelos círculos de usuários:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="text-red-500 text-lg">✗</div>
                <div>
                  <h3 className="font-medium">Discriminação de qualquer tipo</h3>
                  <p className="text-sm text-muted-foreground">Comportamentos que excluem ou prejudicam grupos ou indivíduos.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-red-500 text-lg">✗</div>
                <div>
                  <h3 className="font-medium">Tentativas de monetização externa</h3>
                  <p className="text-sm text-muted-foreground">Uso da plataforma para fins comerciais tradicionais.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-red-500 text-lg">✗</div>
                <div>
                  <h3 className="font-medium">Violação da geolocalização ética</h3>
                  <p className="text-sm text-muted-foreground">Uso inadequado de dados de localização ou invasão de privacidade.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-phase-celebrate">
          <CardHeader>
            <CardTitle className="flex items-center text-phase-celebrate">
              <Users className="mr-2 h-5 w-5" />
              Governança
            </CardTitle>
            <CardDescription>
              Mudanças nos Termos requerem:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="text-green-500">→</div>
                <div>
                  <h3 className="font-medium">Assembleias digitais para debate</h3>
                  <p className="text-sm text-muted-foreground">Espaços abertos onde toda a comunidade pode participar das discussões.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-green-500">→</div>
                <div>
                  <h3 className="font-medium">70% de aprovação dos usuários ativos</h3>
                  <p className="text-sm text-muted-foreground">Consenso amplo necessário para mudanças significativas.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Este acordo é um documento vivo, atualizado coletivamente conforme nossa comunidade cresce e aprende.
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline">
                  📥 Baixar Acordo Completo (texto)
                </Button>
                <Button variant="outline">
                  🎵 Versão em Áudio
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};