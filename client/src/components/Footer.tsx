import * as React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const Footer = () => {
  return (
    <footer className="bg-muted mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Mandala Raiz</h3>
            <p className="text-sm text-muted-foreground">
              Plataforma geolocada de co-criação comunitária
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
              <li><Link to="/faq" className="text-muted-foreground hover:text-foreground">FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground">Política de Privacidade</Link></li>
            </ul>
          </div>
        </div>

        {/* Tutorial Section */}
        <div className="mt-12 border-t border-border pt-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Tutorial de Deploy e Configuração</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Database Tutorial */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2">🗄️</span>
                  Configuração do Banco de Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1. Localização do Banco</h4>
                  <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                    <div>📁 Diretório: <code>./data/database.sqlite</code></div>
                    <div>🔧 Variável: <code>DATA_DIRECTORY</code></div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">2. Deploy no Host</h4>
                  <div className="text-sm space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Passo 1</Badge>
                      <span>Criar pasta data no servidor:</span>
                    </div>
                    <div className="bg-gray-100 p-2 rounded font-mono text-xs">
                      mkdir -p /var/www/mandala-raiz/data
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Passo 2</Badge>
                      <span>Configurar variável de ambiente:</span>
                    </div>
                    <div className="bg-gray-100 p-2 rounded font-mono text-xs">
                      export DATA_DIRECTORY=/var/www/mandala-raiz/data
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Passo 3</Badge>
                      <span>Copiar banco (se existir):</span>
                    </div>
                    <div className="bg-gray-100 p-2 rounded font-mono text-xs">
                      scp ./data/database.sqlite user@host:/var/www/mandala-raiz/data/
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">3. Configurações de Produção</h4>
                  <div className="text-sm space-y-1">
                    <div>• <code>NODE_ENV=production</code></div>
                    <div>• <code>PORT=3001</code> (ou porta desejada)</div>
                    <div>• <code>SESSION_SECRET=chave-secreta-forte</code></div>
                    <div>• <code>JWT_SECRET=jwt-secreto-forte</code></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Git Deploy Tutorial */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2">🚀</span>
                  Deploy com Git
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1. Configurar Git Remote</h4>
                  <div className="text-sm space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">SSH</Badge>
                      <span>Formato do remote:</span>
                    </div>
                    <div className="bg-gray-100 p-2 rounded font-mono text-xs">
                      usuario@ip-do-servidor:caminho/para/repo.git
                    </div>
                    
                    <div>Exemplo prático:</div>
                    <div className="bg-gray-100 p-2 rounded font-mono text-xs">
                      git remote add production root@192.168.1.100:/var/git/mandala-raiz.git
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">2. Comandos de Deploy</h4>
                  <div className="text-sm space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Deploy</Badge>
                      <span>Enviar código:</span>
                    </div>
                    <div className="bg-gray-100 p-2 rounded font-mono text-xs">
                      git push production main
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Build</Badge>
                      <span>No servidor:</span>
                    </div>
                    <div className="bg-gray-100 p-2 rounded font-mono text-xs">
                      npm ci --omit=dev<br/>
                      npm run build<br/>
                      pm2 restart mandala-raiz
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">3. Estrutura no Servidor</h4>
                  <div className="text-sm">
                    <div className="bg-gray-100 p-3 rounded font-mono text-xs">
                      /var/www/mandala-raiz/<br/>
                      ├── dist/ (código compilado)<br/>
                      ├── data/ (banco de dados)<br/>
                      ├── package.json<br/>
                      └── node_modules/
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Environment Variables Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">⚙️</span>
                Variáveis de Ambiente Essenciais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Básicas (Obrigatórias)</h4>
                  <div className="bg-gray-100 p-4 rounded text-sm font-mono space-y-1">
                    <div>NODE_ENV=production</div>
                    <div>PORT=3001</div>
                    <div>DATA_DIRECTORY=/var/www/mandala-raiz/data</div>
                    <div>SESSION_SECRET=sua-chave-secreta-muito-forte</div>
                    <div>JWT_SECRET=seu-jwt-secreto-muito-forte</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">OAuth (Opcionais)</h4>
                  <div className="bg-gray-100 p-4 rounded text-sm font-mono space-y-1">
                    <div>GOOGLE_CLIENT_ID=seu-google-client-id</div>
                    <div>GOOGLE_CLIENT_SECRET=seu-google-secret</div>
                    <div>FACEBOOK_APP_ID=seu-facebook-app-id</div>
                    <div>FACEBOOK_APP_SECRET=seu-facebook-secret</div>
                    <div>GITHUB_CLIENT_ID=seu-github-client-id</div>
                    <div>GITHUB_CLIENT_SECRET=seu-github-secret</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Start Commands */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">⚡</span>
                Comandos Rápidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Desenvolvimento</h4>
                  <div className="bg-gray-100 p-3 rounded font-mono text-xs space-y-1">
                    <div>npm install</div>
                    <div>npm run start</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Build</h4>
                  <div className="bg-gray-100 p-3 rounded font-mono text-xs space-y-1">
                    <div>npm run build</div>
                    <div>node dist/server/index.js</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Produção</h4>
                  <div className="bg-gray-100 p-3 rounded font-mono text-xs space-y-1">
                    <div>pm2 start ecosystem.config.js</div>
                    <div>pm2 save</div>
                    <div>pm2 startup</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
