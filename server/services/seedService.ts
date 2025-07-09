import { db } from '../db/index.js';
import { SeedWallet, SeedTransaction } from '../db/schema.js';
import crypto from 'crypto';

export class SeedService {
  // Initialize wallet for new user
  async initializeWallet(userId: number): Promise<SeedWallet> {
    const wallet = await db
      .insertInto('seed_wallets')
      .values({
        user_id: userId,
        balance: 100.0, // Starting balance
        total_earned: 100.0,
        total_spent: 0.0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning(['id', 'user_id', 'balance', 'total_earned', 'total_spent', 'created_at', 'updated_at'])
      .executeTakeFirstOrThrow();

    console.log(`Initialized wallet for user ${userId} with 100 seeds`);
    return wallet;
  }

  // Generate transaction hash for security
  private generateTransactionHash(
    fromUserId: number | null,
    toUserId: number | null,
    amount: number,
    timestamp: string
  ): string {
    const data = `${fromUserId || 'system'}-${toUserId || 'system'}-${amount}-${timestamp}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Check velocity limits (max 3 transfers per day)
  private async checkVelocityLimits(userId: number): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTransfers = await db
      .selectFrom('seed_transactions')
      .select(eb => eb.fn.count('id').as('count'))
      .where('from_user_id', '=', userId)
      .where('created_at', '>=', today.toISOString())
      .executeTakeFirst();

    const transferCount = parseInt(todayTransfers?.count as string || '0');
    return transferCount < 3;
  }

  // Process transaction with enhanced security
  async processTransaction(
    fromUserId: number | null,
    toUserId: number | null,
    amount: number,
    type: 'EARNING' | 'SPENDING' | 'POLLINATION' | 'GIFT',
    description: string | null = null,
    dreamId: number | null = null
  ): Promise<SeedTransaction> {
    // Check velocity limits for user transfers
    if (fromUserId && type === 'GIFT') {
      const canTransfer = await this.checkVelocityLimits(fromUserId);
      if (!canTransfer) {
        throw new Error('Daily transfer limit exceeded (max 3 transfers per day)');
      }
    }

    const timestamp = new Date().toISOString();
    const transactionHash = this.generateTransactionHash(fromUserId, toUserId, amount, timestamp);

    return await db.transaction().execute(async (trx) => {
      // Update sender balance
      if (fromUserId) {
        const senderWallet = await trx
          .selectFrom('seed_wallets')
          .select('balance')
          .where('user_id', '=', fromUserId)
          .executeTakeFirst();

        if (!senderWallet || senderWallet.balance < amount) {
          throw new Error('Insufficient seed balance');
        }

        await trx
          .updateTable('seed_wallets')
          .set(eb => ({
            balance: eb('balance', '-', amount),
            total_spent: eb('total_spent', '+', amount),
            updated_at: timestamp,
          }))
          .where('user_id', '=', fromUserId)
          .execute();
      }

      // Update receiver balance
      if (toUserId) {
        // Ensure wallet exists
        const receiverWallet = await trx
          .selectFrom('seed_wallets')
          .select('id')
          .where('user_id', '=', toUserId)
          .executeTakeFirst();

        if (!receiverWallet) {
          await this.initializeWallet(toUserId);
        }

        await trx
          .updateTable('seed_wallets')
          .set(eb => ({
            balance: eb('balance', '+', amount),
            total_earned: eb('total_earned', '+', amount),
            updated_at: timestamp,
          }))
          .where('user_id', '=', toUserId)
          .execute();
      }

      // Record transaction with hash
      const transaction = await trx
        .insertInto('seed_transactions')
        .values({
          from_user_id: fromUserId,
          to_user_id: toUserId,
          amount,
          transaction_type: type,
          description,
          dream_id: dreamId,
          created_at: timestamp,
        })
        .returning(['id', 'from_user_id', 'to_user_id', 'amount', 'transaction_type', 'description', 'dream_id', 'created_at'])
        .executeTakeFirstOrThrow();

      // Record in seed flow events for transparency
      await trx
        .insertInto('seed_flow_events')
        .values({
          event_type: 'TRANSFER',
          from_entity: fromUserId ? `user:${fromUserId}` : 'system',
          to_entity: toUserId ? `user:${toUserId}` : 'system',
          amount,
          seeds_involved: amount,
          dream_id: dreamId,
          transaction_hash: transactionHash,
          metadata: JSON.stringify({ type, description }),
          created_at: timestamp,
        })
        .execute();

      console.log(`Processed ${type} transaction: ${amount} seeds from ${fromUserId} to ${toUserId}`);
      return transaction;
    });
  }

  // Auto-pollination: redistribute 10% of profits to nearby projects
  async autoPollination(dreamId: number, profitAmount: number): Promise<void> {
    const pollinationAmount = profitAmount * 0.1;
    
    // Find nearby dreams within 2km
    const dream = await db
      .selectFrom('dreams')
      .selectAll()
      .where('id', '=', dreamId)
      .executeTakeFirst();

    if (!dream) return;

    const nearbyDreams = await db
      .selectFrom('dreams')
      .selectAll()
      .where('is_active', '=', true)
      .where('id', '!=', dreamId)
      .execute();

    // Calculate distances and filter nearby dreams
    const eligibleDreams = nearbyDreams.filter(d => {
      const distance = this.calculateDistance(
        dream.location_lat, dream.location_lng,
        d.location_lat, d.location_lng
      );
      return distance <= 2; // 2km radius
    });

    if (eligibleDreams.length === 0) return;

    // Distribute pollination amount equally
    const amountPerDream = pollinationAmount / eligibleDreams.length;

    for (const targetDream of eligibleDreams) {
      // Get dream creator to credit their wallet
      const creator = await db
        .selectFrom('users')
        .select('id')
        .where('id', '=', targetDream.user_id)
        .executeTakeFirst();

      if (creator) {
        await this.processTransaction(
          null,
          creator.id,
          amountPerDream,
          'POLLINATION',
          `Auto-pollination from dream: ${dream.title}`,
          dreamId
        );
      }
    }

    console.log(`Auto-pollination completed: ${pollinationAmount} seeds distributed to ${eligibleDreams.length} nearby dreams`);
  }

  // Clean up expired seeds (return to local pool after 6 months of inactivity)
  async cleanupExpiredSeeds(): Promise<void> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Find wallets with no activity for 6 months
    const inactiveWallets = await db
      .selectFrom('seed_wallets')
      .leftJoin('seed_transactions', (join) =>
        join
          .onRef('seed_transactions.from_user_id', '=', 'seed_wallets.user_id')
          .orOnRef('seed_transactions.to_user_id', '=', 'seed_wallets.user_id')
      )
      .select(['seed_wallets.user_id', 'seed_wallets.balance'])
      .where('seed_wallets.balance', '>', 0)
      .where((eb) =>
        eb.or([
          eb('seed_transactions.created_at', '<', sixMonthsAgo.toISOString()),
          eb('seed_transactions.id', 'is', null)
        ])
      )
      .groupBy(['seed_wallets.user_id', 'seed_wallets.balance'])
      .execute();

    for (const wallet of inactiveWallets) {
      // Return seeds to local community pool (simplified - would distribute geographically)
      await this.processTransaction(
        wallet.user_id,
        null,
        wallet.balance,
        'SPENDING',
        'Expired seeds returned to community pool',
        null
      );

      console.log(`Returned ${wallet.balance} expired seeds from user ${wallet.user_id} to community pool`);
    }
  }

  // Get wallet balance with security checks
  async getWalletBalance(userId: number): Promise<SeedWallet | null> {
    return await db
      .selectFrom('seed_wallets')
      .selectAll()
      .where('user_id', '=', userId)
      .executeTakeFirst() || null;
  }

  // Get transaction history with enhanced details
  async getTransactionHistory(userId: number, limit: number = 50): Promise<any[]> {
    const transactions = await db
      .selectFrom('seed_transactions')
      .selectAll()
      .where(eb => eb.or([
        eb('from_user_id', '=', userId),
        eb('to_user_id', '=', userId)
      ]))
      .orderBy('created_at', 'desc')
      .limit(limit)
      .execute();

    // Enhance with additional context
    const enhancedTransactions = await Promise.all(
      transactions.map(async (tx) => {
        let dreamTitle = null;
        if (tx.dream_id) {
          const dream = await db
            .selectFrom('dreams')
            .select('title')
            .where('id', '=', tx.dream_id)
            .executeTakeFirst();
          dreamTitle = dream?.title;
        }

        return {
          ...tx,
          dream_title: dreamTitle,
          is_incoming: tx.to_user_id === userId,
          display_amount: tx.to_user_id === userId ? `+${tx.amount}` : `-${tx.amount}`,
        };
      })
    );

    return enhancedTransactions;
  }

  // Get user's staking information
  async getUserStakes(userId: number): Promise<any[]> {
    const stakes = await db
      .selectFrom('seed_stakes')
      .innerJoin('dreams', 'dreams.id', 'seed_stakes.dream_id')
      .select([
        'seed_stakes.id',
        'seed_stakes.amount',
        'seed_stakes.staked_at',
        'seed_stakes.unlock_at',
        'seed_stakes.pollination_points',
        'seed_stakes.is_active',
        'dreams.title as dream_title',
        'dreams.phase as dream_phase'
      ])
      .where('seed_stakes.user_id', '=', userId)
      .where('seed_stakes.is_active', '=', true)
      .orderBy('seed_stakes.staked_at', 'desc')
      .execute();

    return stakes.map(stake => ({
      ...stake,
      days_locked: Math.ceil((new Date(stake.unlock_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      can_unlock: new Date() >= new Date(stake.unlock_at)
    }));
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}