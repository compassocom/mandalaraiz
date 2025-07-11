import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, HelpCircle } from 'lucide-react';

export const RegenerativeFAQPage = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "O que é economia regenerativa?",
      answer: "Economia regenerativa é um sistema econômico que visa restaurar e revitalizar comunidades e ecossistemas, em vez de apenas sustentá-los. No Mandala Raiz, isso se manifesta através do sistema Seeds & Roots, onde a participação gera valor real e os lucros são redistribuídos para fortalecer a comunidade."
    },
    {
      question: "Como funcionam as Seeds e Roots?",
      answer: "Seeds são moedas de participação que você ganha colaborando na plataforma. Roots são moedas de valor real que podem ser convertidas em dinheiro. A cada transação, 10% das Seeds são 'queimadas' para prevenir inflação, e parte dos lucros é redistribuída automaticamente para projetos próximos (auto-polinização)."
    },
    {
      question: "O que é auto-polinização?",
      answer: "Auto-polinização é o mecanismo pelo qual 10% dos lucros de projetos bem-sucedidos são automaticamente redistribuídos para outros projetos em um raio de 2km. Isso garante que o sucesso de um projeto beneficie toda a comunidade local."
    },
    {
      question: "Como a localização influencia a plataforma?",
      answer: "A plataforma é geolocada, permitindo descobrir sonhos e projetos em um raio de 200m a 2km. Isso fortalece conexões locais e facilita colaborações presenciais, criando verdadeiras redes comunitárias."
    },
    {
      question: "O que são as fases dos sonhos?",
      answer: "Todo sonho passa por 4 fases: SONHAR (compartilhar a visão), PLANEJAR (organizar tarefas), AGIR (executar o projeto) e CELEBRAR (compartilhar resultados). Cada fase tem ferramentas específicas para apoiar o desenvolvimento."
    },
    {
      question: "Como funciona o limite de ativação?",
      answer: "Projetos precisam de pelo menos 3 pessoas para serem ativados. Isso garante colaboração real e previne projetos individuais que não geram impacto comunitário."
    },
    {
      question: "O que é o painel de energia?",
      answer: "O painel de energia monitora a saúde de projetos através de métricas como colaboração, diversidade e progresso de tarefas. Funciona como um 'semáforo' indicando se um projeto está prosperando ou precisa de atenção."
    },
    {
      question: "Como funciona o marketplace?",
      answer: "No marketplace, você pode comprar e vender produtos/serviços usando Seeds. Há um sistema de reputação baseado em avaliações, e uma taxa de 5% apoia a manutenção da plataforma."
    },
    {
      question: "Posso retirar dinheiro real?",
      answer: "Sim! Você pode converter Seeds em Roots (100:1) e depois sacar Roots como dinheiro real. O saque mínimo é de 10.000 Roots (equivalente a $100) com uma taxa de 5%."
    },
    {
      question: "A plataforma é segura?",
      answer: "Sim, implementamos múltiplas camadas de segurança: limites diários de Seeds para prevenir farming, sistema de burn para controlar inflação, rate limiting para transações, e todas as operações são registradas para transparência."
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
        <div className="flex items-center space-x-3">
          <HelpCircle className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold">FAQ Regenerativo</h1>
            <p className="text-muted-foreground">
              Perguntas frequentes sobre economia regenerativa e a plataforma
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{faq.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Ainda tem dúvidas?</CardTitle>
          <CardDescription>
            Entre em contato conosco ou participe da comunidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
              Contato: help@mandalaraiz.org
            </Button>
            <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
              Comunidade Discord
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};