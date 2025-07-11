import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

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
        <h1 className="text-3xl font-bold">Política de Privacidade</h1>
        <p className="text-muted-foreground">
          Como protegemos e utilizamos suas informações
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Coleta de Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Coletamos informações que você nos fornece diretamente, como:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nome e endereço de email</li>
              <li>Localização geográfica (quando autorizada)</li>
              <li>Conteúdo dos sonhos e projetos criados</li>
              <li>Interações na plataforma</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uso das Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Utilizamos suas informações para:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Conectar você com projetos e pessoas próximas</li>
              <li>Facilitar colaborações comunitárias</li>
              <li>Melhorar a experiência da plataforma</li>
              <li>Processar transações de Seeds e Roots</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compartilhamento de Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Seus dados são compartilhados apenas:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Com outros usuários da plataforma, conforme sua configuração de privacidade</li>
              <li>Para fins de colaboração em projetos que você participa</li>
              <li>Quando exigido por lei</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Nunca vendemos seus dados pessoais para terceiros.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seus Direitos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Você tem direito a:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir informações incorretas</li>
              <li>Solicitar exclusão de sua conta</li>
              <li>Controlar configurações de privacidade</li>
              <li>Exportar seus dados</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Segurança</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Implementamos medidas de segurança técnicas e organizacionais apropriadas 
              para proteger suas informações pessoais contra acesso não autorizado, 
              alteração, divulgação ou destruição.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contato</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Para questões sobre privacidade, entre em contato conosco em:
            </p>
            <p className="mt-2 font-medium">privacy@mandalaraiz.org</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};