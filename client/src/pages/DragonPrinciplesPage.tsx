import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Flame, Heart, Zap, Sparkles } from 'lucide-react';

export const DragonPrinciplesPage = () => {
  const navigate = useNavigate();

  const principles = [
    {
      title: "Sonhar",
      subtitle: "Visão Coletiva",
      icon: <Flame className="h-6 w-6" />,
      color: "phase-dream",
      description: "Criamos espaços seguros para sonhos ousados emergirem. Toda visão é sagrada e merece ser ouvida.",
      practices: [
        "Círculos de escuta sem julgamento",
        "Visualização coletiva de futuros possíveis",
        "Honrar todas as perspectivas, especialmente as marginalizadas",
        "Mapear sonhos através de arte e storytelling"
      ]
    },
    {
      title: "Planejar",
      subtitle: "Sabedoria Estratégica",
      icon: <Heart className="h-6 w-6" />,
      color: "phase-plan",
      description: "Transformamos sonhos em planos viáveis através da inteligência coletiva e recursos compartilhados.",
      practices: [
        "Análise de recursos disponíveis na comunidade",
        "Identificação de riscos com compaixão",
        "Cronogramas flexíveis que respeitam ritmos humanos",
        "Parcerias baseadas em abundância, não escassez"
      ]
    },
    {
      title: "Agir",
      subtitle: "Implementação Regenerativa",
      icon: <Zap className="h-6 w-6" />,
      color: "phase-act",
      description: "Colocamos planos em movimento através de ação coordenada que nutre tanto pessoas quanto planeta.",
      practices: [
        "Divisão de tarefas baseada em dons pessoais",
        "Check-ins regulares para prevenir esgotamento",
        "Celebração de pequenos progressos",
        "Adaptação contínua baseada em feedback"
      ]
    },
    {
      title: "Celebrar",
      subtitle: "Gratidão & Aprendizado",
      icon: <Sparkles className="h-6 w-6" />,
      color: "phase-celebrate",
      description: "Honramos conquistas, aprendemos com desafios e preparamos o solo para novos ciclos.",
      practices: [
        "Rituais de gratidão para todos os contribuintes",
        "Documentação de lições aprendidas",
        "Distribuição de benefícios de forma equitativa",
        "Preparação para o próximo ciclo de sonhos"
      ]
    }
  ];

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
        <h1 className="text-3xl font-bold mb-2">Princípios do Dragão</h1>
        <p className="text-muted-foreground">
          Código de conduta baseado na metodologia Dragon Dreaming
        </p>
      </div>

      <div className="mb-8">
        <Card className="bg-gradient-to-r from-red-50 via-yellow-50 via-blue-50 to-green-50">
          <CardHeader>
            <CardTitle className="text-center">Filosofia Central</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-lg leading-relaxed">
              "O dragão representa a força transformadora que emerge quando diversas perspectivas se unem 
              em harmonia. Cada fase do ciclo é sagrada e essencial para a manifestação de sonhos regenerativos."
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8">
        {principles.map((principle, index) => (
          <Card key={index} className={`border-2 border-${principle.color}`}>
            <CardHeader>
              <CardTitle className={`flex items-center text-xl text-${principle.color}`}>
                {principle.icon}
                <div className="ml-3">
                  <div>{principle.title}</div>
                  <div className="text-sm font-normal text-muted-foreground">{principle.subtitle}</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{principle.description}</p>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Práticas Essenciais:</h4>
                <ul className="space-y-2">
                  {principle.practices.map((practice, practiceIndex) => (
                    <li key={practiceIndex} className="flex items-start space-x-2">
                      <div className={`w-2 h-2 rounded-full bg-${principle.color} mt-2 flex-shrink-0`}></div>
                      <span className="text-sm text-muted-foreground">{practice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Governança Circular</CardTitle>
            <CardDescription>
              Como tomamos decisões coletivas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Círculos de Decisão:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Todas as vozes são ouvidas</li>
                  <li>• Consenso aproximado (70%)</li>
                  <li>• Direito de veto por impacto ético</li>
                  <li>• Rotação de liderança</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Resolução de Conflitos:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Mediação com facilitadores neutros</li>
                  <li>• Foco em necessidades, não posições</li>
                  <li>• Comunicação não-violenta</li>
                  <li>• Restauração vs. punição</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              Estes princípios são vivos e evoluem com nossa comunidade
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline">
                📖 Guia Completo Dragon Dreaming
              </Button>
              <Button variant="outline">
                🎭 Exemplos de Aplicação
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};