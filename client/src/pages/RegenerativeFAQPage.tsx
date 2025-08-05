import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, HelpCircle } from 'lucide-react';

export const RegenerativeFAQPage = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "O que é o Mandala Raiz?",
      answer: "Mandala Raiz é uma plataforma geolocada de co-criação comunitária que conecta pessoas próximas para colaborar em projetos e sonhos compartilhados. Focamos em construir comunidade e facilitar colaboração local."
    },
    {
      question: "Como funciona a localização na plataforma?",
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
      answer: "No marketplace, você pode anunciar e encontrar produtos/serviços na sua comunidade local. O sistema filtra automaticamente por distância, mostrando apenas itens próximos a você."
    },
    {
      question: "Como posso participar de um sonho?",
      answer: "Explore sonhos próximos na página Dashboard, encontre projetos que ressoem com você e participe das tarefas colaborativas. A plataforma facilita a conexão entre pessoas com interesses similares."
    },
    {
      question: "A plataforma é gratuita?",
      answer: "Sim! A plataforma é completamente gratuita para uso. Nosso objetivo é facilitar colaboração comunitária e fortalecer conexões locais sem barreiras financeiras."
    },
    {
      question: "Como funciona a gestão de tarefas?",
      answer: "Cada sonho tem um sistema colaborativo de gestão de tarefas com diferentes prioridades e status. Membros podem criar, assumir e completar tarefas, facilitando a execução de projetos em equipe."
    },
    {
      question: "Posso criar múltiplos sonhos?",
      answer: "Sim! Você pode criar quantos sonhos quiser e participar de múltiplos projetos simultaneamente. A plataforma foi projetada para apoiar pessoas ativas na comunidade."
    },
    {
      question: "Como fazer login na plataforma?",
      answer: "Você pode fazer login com email/senha ou usar login social com Google, Facebook ou GitHub (quando configurados). Também existem contas de teste: admin@mandalaraiz.org (senha: admin123) e moderator@mandalaraiz.org (senha: moderator123)."
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
            <h1 className="text-3xl font-bold">FAQ - Perguntas Frequentes</h1>
            <p className="text-muted-foreground">
              Tire suas dúvidas sobre a plataforma e colaboração comunitária
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
