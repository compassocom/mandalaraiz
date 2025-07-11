import * as React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-muted mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Mandala Raiz</h3>
            <p className="text-sm text-muted-foreground">
              Plataforma geolocada de co-criação comunitária com economia regenerativa
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Plataforma</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/dashboard" className="text-muted-foreground hover:text-foreground">Explorar Sonhos</Link></li>
              <li><Link to="/create-dream" className="text-muted-foreground hover:text-foreground">Criar Sonho</Link></li>
              <li><Link to="/marketplace" className="text-muted-foreground hover:text-foreground">Marketplace</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Comunidade</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/principles" className="text-muted-foreground hover:text-foreground">Princípios Dragon</Link></li>
              <li><Link to="/agreement" className="text-muted-foreground hover:text-foreground">Acordo de Cuidado</Link></li>
              <li><Link to="/faq" className="text-muted-foreground hover:text-foreground">FAQ Regenerativo</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground">Política de Privacidade</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Mandala Raiz. Cultivando sonhos em comunidade.
          </p>
        </div>
      </div>
    </footer>
  );
};