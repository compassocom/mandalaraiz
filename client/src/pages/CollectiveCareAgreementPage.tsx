import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, Shield, Users, Lightbulb } from 'lucide-react';

export const CollectiveCareAgreementPage = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: <Heart className="h-6 w-6 text-red-500" />,
      title: "Cuidado Mútuo",
      items: [
        "Priorizamos o bem-estar coletivo sobre ganhos individuais",
        "Oferecemos apoio emocional e prático quando necessário",
        "Reconhecemos e celebramos as contribuições de cada pessoa",
        "Praticamos escuta ativa e comunicação compassiva"
      ]
    },
    {
      icon: <Shield className="h-6 w-6 text-blue-500" />,
      title: "Espaço Seguro",
      items: [
        "Criamos um ambiente livre de discriminação e violência",
        "Respeitamos diferentes identidades, culturas e perspectivas",
        "Mantemos confidencialidade quando solicitado",
        "Intervimos ativamente contra comportamentos prejudiciais"
      ]
    },
    {
      icon: <Users className="h-6 w-6 text-green-500" />,
      title: "Participação Consciente",
      items: [
        "Participamos de forma genuína e transparente",
        "Assumimos responsabilidade por nossos impactos",
        "Buscamos consenso sempre que possível",
        "Comprometemo-nos com processos de tomada de decisão coletiva"
      ]
    },
    {
      icon: <Lightbulb className="h-6 w-6 text-yellow-500" />,
      title: "Crescimento Conjunto",
      items: [
        "Vemos conflitos como oportunidades de aprendizado",
        "Praticamos feedback construtivo e receptivo",
        "Compartilhamos conhecimentos e recursos generosamente",
        "Apoiamos o desenvolvimento pessoal e coletivo"
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
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
          <h1 className="text-4xl font-bold mb-4">Acordo de Cuidado Coletivo</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Nosso compromisso mútuo para criar e manter uma comunidade próspera, 
            segura e regenerativa para todas as pessoas.
          </p>
        </div>
      </div>

      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-center">Filosofia do Cuidado Coletivo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground leading-relaxed">
            Acreditamos que o cuidado coletivo é mais que estar junto - é escolher 
            ativamente o bem-estar uns dos outros. É criar estruturas que nos sustentam 
            mutuamente e nos permitem prosperar juntos, especialmente nos momentos difíceis.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-6 mb-8">
        {sections.map((section, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                {section.icon}
                <CardTitle>{section.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Resolução de Conflitos</CardTitle>
          <CardDescription>
            Como abordamos divergências e tensões de forma construtiva
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">1. Abordagem Direta e Respeitosa</h4>
              <p className="text-sm text-muted-foreground">
                Encorajamos conversas diretas entre as partes envolvidas, 
                sempre com respeito e intenção de compreensão mútua.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">2. Mediação Comunitária</h4>
              <p className="text-sm text-muted-foreground">
                Quando necessário, facilitadores neutros da comunidade 
                ajudam a mediar conversas e encontrar soluções.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">3. Círculos Restaurativos</h4>
              <p className="text-sm text-muted-foreground">
                Para questões mais complexas, utilizamos círculos restaurativos 
                que focam em cura, aprendizado e fortalecimento de relações.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">4. Suporte Contínuo</h4>
              <p className="text-sm text-muted-foreground">
                Oferecemos acompanhamento e suporte após resoluções para 
                garantir que as relações sejam verdadeiramente restauradas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Responsabilidades Individuais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Consigo Mesmo</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Praticar autocuidado e estabelecer limites saudáveis</li>
                <li>• Refletir sobre meus impactos e comportamentos</li>
                <li>• Buscar crescimento pessoal contínuo</li>
                <li>• Comunicar minhas necessidades claramente</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Com a Comunidade</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Contribuir ativamente para o bem-estar coletivo</li>
                <li>• Respeitar diversidade e diferenças</li>
                <li>• Participar de forma construtiva nas decisões</li>
                <li>• Apoiar outros membros em suas jornadas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Compromisso Vivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-green-700">
              Este acordo é um documento vivo que evolui com nossa comunidade. 
              Ele é revisado regularmente através de processos participativos, 
              garantindo que reflita nossas necessidades e valores atuais.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Revisão Trimestral</Badge>
              <Badge variant="secondary">Participação Aberta</Badge>
              <Badge variant="secondary">Decisão Consensual</Badge>
              <Badge variant="secondary">Implementação Gradual</Badge>
            </div>
            <p className="text-sm text-green-600">
              Ao participar da nossa comunidade, você concorda em honrar 
              este acordo e contribuir para sua contínua evolução.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};