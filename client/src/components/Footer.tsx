import * as React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Github, MessageCircle, Instagram, Twitter, Leaf } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-red-500 via-yellow-500 via-blue-500 to-green-500 bg-clip-text text-transparent">
              Mandala Raiz
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Uma tecnologia viva, não uma corporação. Nossa entidade legal existe para cuidar, não para lucrar.
            </p>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Heart className="h-3 w-3 text-red-500" />
              <span>Moeda Sementes não é um ativo financeiro</span>
            </div>
          </div>

          {/* Core Links */}
          <div>
            <h4 className="font-semibold mb-4 text-phase-dream">Links Essenciais</h4>
            <div className="space-y-2 text-sm">
              <Link to="/agreement" className="block text-muted-foreground hover:text-foreground transition-colors">
                Acordo de Cuidado Coletivo
              </Link>
              <Link to="/privacy" className="block text-muted-foreground hover:text-foreground transition-colors">
                Proteção de Dados Sagrados
              </Link>
              <Link to="/faq" className="block text-muted-foreground hover:text-foreground transition-colors">
                Perguntas que Nutrem Sonhos
              </Link>
              <Link to="/principles" className="block text-muted-foreground hover:text-foreground transition-colors">
                Princípios do Dragão
              </Link>
              <Link to="/support" className="block text-muted-foreground hover:text-foreground transition-colors">
                Círculo de Apoio
              </Link>
            </div>
          </div>

          {/* Community & Ethics */}
          <div>
            <h4 className="font-semibold mb-4 text-phase-act">Comunidade Ética</h4>
            <div className="space-y-2 text-sm">
              <a 
                href="https://github.com/mandala-raiz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-3 w-3" />
                <span>100% código aberto</span>
              </a>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Leaf className="h-3 w-3 text-green-500" />
                <span>Hospedagem verde</span>
              </div>
              <div className="text-muted-foreground">
                Algoritmos auditados por ONG
              </div>
              <Link to="/transparency" className="block text-muted-foreground hover:text-foreground transition-colors">
                Bosque da Transparência
              </Link>
            </div>
          </div>

          {/* Social & Connect */}
          <div>
            <h4 className="font-semibold mb-4 text-phase-celebrate">Conectar-se</h4>
            <div className="space-y-2 text-sm">
              <a 
                href="https://discord.gg/mandala-raiz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="h-3 w-3" />
                <span>Juntar-se ao círculo</span>
              </a>
              <a 
                href="https://instagram.com/mandalaraiz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="h-3 w-3" />
                <span>Regar esta rede</span>
              </a>
              <a 
                href="https://twitter.com/mandalaraiz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-3 w-3" />
                <span>Seguir nosso voo</span>
              </a>
              <div className="text-muted-foreground">
                Resposta em 48h
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-xs text-muted-foreground">
            © 2024 Coletivo Mandala Raiz – Todos os direitos compartilhados (CC BY-NC-SA)
          </div>
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span>Economia regenerativa</span>
            <span>•</span>
            <span>Tecnologia como facilitadora humilde</span>
          </div>
        </div>
      </div>
    </footer>
  );
};