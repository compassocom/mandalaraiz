import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, TrendingDown, Zap } from 'lucide-react';

interface SeedWallet {
  id: number;
  user_id: number;
  balance: number;
  total_earned: number;
  total_spent: number;
}

interface SeedTransaction {
  id: number;
  from_user_id: number | null;
  to_user_id: number | null;
  amount: number;
  transaction_type: 'EARNING' | 'SPENDING' | 'POLLINATION' | 'GIFT';
  description: string | null;
  created_at: string;
}

interface SeedWalletProps {
  userId: number;
}

export const SeedWallet = ({ userId }: SeedWalletProps) => {
  const [wallet, setWallet] = useState<SeedWallet | null>(null);
  const [transactions, setTransactions] = useState<SeedTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWalletData();
  }, [userId]);

  const fetchWalletData = async () => {
    try {
      const [walletResponse, transactionsResponse] = await Promise.all([
        fetch(`/api/users/${userId}/wallet`),
        fetch(`/api/users/${userId}/transactions?limit=10`)
      ]);

      if (!walletResponse.ok || !transactionsResponse.ok) {
        throw new Error('Failed to fetch wallet data');
      }

      const walletData = await walletResponse.json();
      const transactionsData = await transactionsResponse.json();

      setWallet(walletData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'EARNING': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'SPENDING': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'POLLINATION': return <Zap className="h-4 w-4 text-blue-500" />;
      case 'GIFT': return <Coins className="h-4 w-4 text-purple-500" />;
      default: return <Coins className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'EARNING': return 'bg-green-500';
      case 'SPENDING': return 'bg-red-500';
      case 'POLLINATION': return 'bg-blue-500';
      case 'GIFT': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading wallet...</div>;
  }

  if (!wallet) {
    return <div className="text-center py-4 text-red-500">Failed to load wallet</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center">
            <Coins className="mr-2 h-5 w-5" />
            Seed Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-3xl font-bold mb-2">{wallet.balance.toFixed(1)}</div>
          <div className="text-sm text-muted-foreground">
            Seeds available for collaboration
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">
              +{wallet.total_earned.toFixed(1)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600">
              -{wallet.total_spent.toFixed(1)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="flex items-center space-x-2">
                  {getTransactionIcon(transaction.transaction_type)}
                  <div>
                    <div className="font-medium text-sm">
                      {transaction.description || transaction.transaction_type}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${
                    transaction.to_user_id === userId ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.to_user_id === userId ? '+' : '-'}{transaction.amount.toFixed(1)}
                  </div>
                  <Badge className={getTransactionColor(transaction.transaction_type)} variant="secondary">
                    {transaction.transaction_type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {transactions.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No transactions yet
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Seed Economy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Auto-Pollination:</span>
              <span className="font-medium">10% of profits</span>
            </div>
            <div className="flex justify-between">
              <span>Collaboration Rewards:</span>
              <span className="font-medium">Task completion</span>
            </div>
            <div className="flex justify-between">
              <span>Community Impact:</span>
              <span className="font-medium">Dream success</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};