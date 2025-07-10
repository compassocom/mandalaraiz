import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, HelpCircle, Sprout, Shield, Users, Code } from 'lucide-react';

export const RegenerativeFAQPage = () => {
  const navigate = useNavigate();

  const faqSections = [
    {
      title: "Sobre a Plataforma",
      icon: <Sprout className="h-5 w-5" />,
      color: "phase-dream",
      questions: [
        {
          q: "Como isso é diferente de outros aplicativos de projetos?",
          a: "Mandala Raiz é uma ferramenta ritual, não um aplicativo de produtividade. Medimos sucesso em 'relacionamentos curados' e 'árvores plantadas', não em curtidas ou velocidade."
        },
        {
          q: "Posso sacar a Moeda Sementes?",
          a: "Não. Sementes são créditos não-monetários para financiar outros sonhos. Pense nelas como 'pedras de agradecimento'."
        }
      ]
    },
    {
      title: "Privacidade & Segurança",
      icon: <Shield className="h-5 w-5" />,
      color: "phase-plan",
      questions: [
        {
          q: "Quem pode ver meus sonhos?",
          a: "Apenas usuários dentro do seu raio escolhido (200m-2km). Você pode alternar o anonimato a qualquer momento."
        },
        {
          q: "E se alguém usar mal a plataforma?",
          a: "Comunidades se auto-governam através de 'Círculos do Dragão' que votam em remoções (veja Código de Conduta)."
        }
      ]
    },
    {
      title: "Dragon Dreaming",
      icon: <Users className="h-5 w-5" />,
      color: "phase-act",
      questions: [
        {
          q: "Por que exigir 3 territórios para iniciar um sonho?",
          a: "Diversidade previne câmaras de eco! Tecer perspectivas diferentes é fundamental para projetos regenerativos."
        },
        {
          q: "Como o esgotamento é prevenido?",
          a: "O Painel de Energia sinaliza desequilíbrios (ex: 'Maria fez 80% das tarefas'), e as tarefas têm limites rígidos."
        }
      ]
    },
    {
      title: "Técnico",
      icon: <Code className="h-5 w-5" />,
      color: "phase-celebrate",
      questions: [
        {
          q: "Meus dados são vendidos para anunciantes?",
          a: "Nunca. Rejeitamos o capitalismo de vigilância. Suas habilidades/localização existem apenas para conectar sonhadores."
        },
        {
          q: "Como posso auditar os algoritmos?",
          a: "Todo código é open-source. Nossa página 'Bosque da Transparência' explica sistemas-chave em linguagem simples."
        }
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
        <h1 className="text-3xl font-bold mb-2">Perguntas que Nutrem Sonhos</h1>
        <p className="text-muted-foreground">
          Respostas regenerativas para construir entendimento coletivo
        </p>
      </div>

      <div className="space-y-8">
        {faqSections.map((section, sectionIndex) => (
          <Card key={sectionIndex} className={`border-${section.color}`}>
            <CardHeader>
              <CardTitle className={`flex items-center text-${section.color}`}>
                {section.icon}
                <span className="ml-2">{section.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {section.questions.map((faq, faqIndex) => (
                  <div key={faqIndex} className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{faq.q}</h3>
                        <p className="text-sm text-muted-foreground mt-2">{faq.a}</p>
                      </div>
                    </div>
                    {faqIndex < section.questions.length - 1 && (
                      <div className="border-b border-gray-100 my-4"></div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="bg-gradient-to-r from-blue-50 to-green-50">
          <CardHeader>
            <CardTitle className="text-center">Ainda tem perguntas?</CardTitle>
            <CardDescription className="text-center">
              Nossa comunidade está aqui para nutrir sua curiosidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center space-x-4">
              <Button variant="outline">
                💬 Círculo de Apoio
              </Button>
              <Button variant="outline">
                📚 Manifesto Econômico
              </Button>
              <Button variant="outline">
                🌳 Bosque da Transparência
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Resposta garantida em 48 horas com carinho da nossa comunidade
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};