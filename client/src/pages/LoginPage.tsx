import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, LogIn, Mail, Github, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // PASSO 1: Importar o useAuth

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // PASSO 2: Obter a função de login do contexto
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  // O useEffect para login social permanece o mesmo
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const oauthError = urlParams.get('error');
    
    if (token) {
      // Se um token vier do login social, precisamos de obter os dados do utilizador
      // e usar a nossa função de login para atualizar o estado globalmente.
      const fetchUserAndLogin = async () => {
        try {
            const response = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                login({ user: data.user, token }); // Usa a função de login do contexto
                navigate('/dashboard');
            } else {
                setError('Falha ao obter dados do utilizador após login social.');
            }
        } catch (err) {
            setError('Erro de rede ao obter dados do utilizador.');
        }
      };
      fetchUserAndLogin();
    }
    
    if (oauthError) {
      setError('Erro durante o login social. Tente novamente.');
    }
  }, [location, navigate, login]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha no login');
      }

      const data = await response.json();
      
      // --- PASSO 3: A CORREÇÃO PRINCIPAL ---
      // Em vez de usar localStorage.setItem, chamamos a função do nosso contexto.
      login(data);
      
      // O redirecionamento continua o mesmo
      const redirectPath = data.redirectTo || (data.user.role === 'ADMIN' ? '/admin' : '/dashboard');
      navigate(redirectPath);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Início
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 via-blue-500 to-green-500 mx-auto mb-4"></div>
            <CardTitle className="text-2xl">Entrar</CardTitle>
            <CardDescription>
              Entre na sua conta para acessar a plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Digite sua senha"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-phase-dream border-0" 
                disabled={isLoading}
              >
                <LogIn className="mr-2 h-4 w-4" />
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Ou tente com
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin('google')}
                  className="w-full"
                  title="Login com Google"
                >
                  <Mail className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin('facebook')}
                  className="w-full"
                  title="Login com Facebook"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin('github')}
                  className="w-full"
                  title="Login com GitHub"
                >
                  <Github className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Não tem uma conta?{' '}
                  <Link to="/register" className="text-phase-dream hover:underline">
                    Cadastre-se aqui
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
