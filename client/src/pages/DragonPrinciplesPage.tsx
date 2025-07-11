import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Flame, Heart, Eye, Users } from 'lucide-react';

export const DragonPrinciplesPage = () => {
  const navigate = useNavigate();

  const principles = [
    {
      icon: <Flame className="h-6 w-6" />,
      title: "Fogo Transformador",
      subtitle: "Ação Corajosa",
      description: "Como o dragão que transforma com seu fogo, abraçamos mudanças necessárias com coragem. Não tememos destruir estruturas obsoletas para criar algo novo e melhor.",
      practices: [
        "Questionar sistemas que não servem mais",
        "Agir com determinação diante de resistências",
        "Transformar conflitos em oportunidades de crescimento",
        "Implementar mudanças mesmo quando desconfortáveis"
      ],
      color: "border-red-500"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Coração Compassivo",
      subtitle: "Cuidado Radical",
      description: "O dragão protege o que ama com ferocidade. Cultivamos cuidado radical - não apenas gentileza, mas proteção ativa do bem-estar coletivo.",
      practices: [
        "Priorizar o bem-estar da comunidade",
        "Oferecer apoio sem esperar retorno",
        "Defender os vulneráveis com determinação",
        "Praticar escuta profunda e empática"
      ],
      color: "border-pink-500"
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Visão Penetrante",
      subtitle: "Clareza Sistêmica",
      description: "Com a visão aguçada do dragão, vemos além das aparências. Compreendemos sistemas complexos e suas interconexões profundas.",
      practices: [
        "Analisar causas raiz, não apenas sintomas",
        "Reconhecer padrões e ciclos repetitivos",
        "Anticipar consequências de longo prazo",
        "Integrar múltiplas perspectivas antes de decidir"
      ],
      color: "border-blue-500"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Sabedoria Ancestral",
      subtitle: "Conhecimento Coletivo",
      description: "Como dragões guardiões de tesouros, honramos e preservamos a sabedoria coletiva, integrando conhecimento ancestral com inovação contemporânea.",
      practices: [
        "Valorizar experiências e conhecimentos diversos",
        "Documentar e compartilhar aprendizados",
        "Conectar tradições com soluções modernas",
        "Aprender com sucessos e fracassos históricos"
      ],
      color: "border-green-500"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Início
        </Button>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Princípios Dragon</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Inspirados na força, sabedoria e proteção dos dragões, estes princípios guiam nossa 
            abordagem para transformação social e construção comunitária.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {principles.map((principle, index) => (
          <Card key={index} className={`${principle.color} border-2`}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {principle.icon}
                </div>
                <div>
                  <CardTitle className="text-xl">{principle.title}</CardTitle>
                  <CardDescription className="text-base font-medium">
                    {principle.subtitle}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {principle.description}
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Práticas:</h4>
                <ul className="space-y-1">
                  {principle.practices.map((practice, practiceIndex) => (
                    <li key={practiceIndex} className="text-sm text-muted-foreground flex items-start">
                      <span className="mr-2 mt-1">•</span>
                      <span>{practice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Integração dos Princípios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-center text-muted-foreground leading-relaxed">
              Estes princípios não são isolados - eles se integram e se fortalecem mutuamente. 
              Um verdadeiro agente de transformação combina todos os quatro aspectos.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Na Prática Individual</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Cultive coragem para mudanças necessárias</li>
                  <li>• Desenvolva compaixão ativa pelo coletivo</li>
                  <li>• Aprofunde sua visão sistêmica</li>
                  <li>• Honre e compartilhe conhecimento</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Na Construção Comunitária</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Transforme estruturas que limitam potencial</li>
                  <li>• Proteja e cuide dos membros vulneráveis</li>
                  <li>• Tome decisões com visão de longo prazo</li>
                  <li>• Integre diversas formas de conhecimento</li>
                </ul>
              </div>
            </div>

            <div className="text-center pt-4">
              <Badge variant="secondary" className="px-4 py-2">
                "Como dragões, somos simultaneamente força transformadora e guardiões compassivos"
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};