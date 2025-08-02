import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, CheckCircle } from 'lucide-react';

interface SeedWalletProps {
  userId: number;
}

export const SeedWallet = ({ userId }: SeedWalletProps) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center">
            <Users className="mr-2 h-5 w-5" />
            Participação
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-sm text-muted-foreground">
            Sua contribuição para a comunidade
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              Tarefas Concluídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tarefas completadas com sucesso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-blue-600" />
              Projetos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sonhos que você está participando
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Engajamento Comunitário</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Colaboração:</span>
              <span className="font-medium">Ativo</span>
            </div>
            <div className="flex justify-between">
              <span>Impacto Local:</span>
              <span className="font-medium">Crescendo</span>
            </div>
            <div className="flex justify-between">
              <span>Networking:</span>
              <span className="font-medium">Expandindo</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};