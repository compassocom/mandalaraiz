import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserCircle, LogIn, UserPlus } from 'lucide-react';

export const Header = () => {
  const location = useLocation();
  
  // Don't show header on login/register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 via-blue-500 to-green-500"></div>
              <span className="font-bold text-xl">Mandala Raiz</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/dashboard" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Explorar Sonhos
            </Link>
            <Link 
              to="/create-dream" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Criar Sonho
            </Link>
            <Link 
              to="/marketplace" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Marketplace
            </Link>
          </nav>

          <div className="flex items-center space-x-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                <LogIn className="mr-2 h-4 w-4" />
                Entrar
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-phase-dream border-0">
                <UserPlus className="mr-2 h-4 w-4" />
                Cadastrar
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};