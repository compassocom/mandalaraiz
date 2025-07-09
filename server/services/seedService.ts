import { db } from '../db/index.js';
import { SeedWallet, SeedTransaction } from '../db/schema.js';

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

  // Process transaction
  async processTransaction(
    fromUserId: number | null,
    toUserId: number | null,
    amount: number,
    type: 'EARNING' | 'SPENDING' | 'POLLINATION' | 'GIFT',
    description: string | null = null,
    dreamId: number | null = null
  ): Promise<SeedTransaction> {
    return await db.transaction().execute(async (trx) => {
      // Update sender balance
      if (fromUserId) {
        await trx
          .updateTable('seed_wallets')
          .set(eb => ({
            balance: eb('balance', '-', amount),
            total_spent: eb('total_spent', '+', amount),
            updated_at: new Date().toISOString(),
          }))
          .where('user_id', '=', fromUserId)
          .execute();
      }

      // Update receiver balance
      if (toUserId) {
        await trx
          .updateTable('seed_wallets')
          .set(eb => ({
            balance: eb('balance', '+', amount),
            total_earned: eb('total_earned', '+', amount),
            updated_at: new Date().toISOString(),
          }))
          .where('user_id', '=', toUserId)
          .execute();
      }

      // Record transaction
      const transaction = await trx
        .insertInto('seed_transactions')
        .values({
          from_user_id: fromUserId,
          to_user_id: toUserId,
          amount,
          transaction_type: type,
          description,
          dream_id: dreamId,
          created_at: new Date().toISOString(),
        })
        .returning(['id', 'from_user_id', 'to_user_id', 'amount', 'transaction_type', 'description', 'dream_id', 'created_at'])
        .executeTakeFirstOrThrow();

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

  // Get wallet balance
  async getWalletBalance(userId: number): Promise<SeedWallet | null> {
    return await db
      .selectFrom('seed_wallets')
      .selectAll()
      .where('user_id', '=', userId)
      .executeTakeFirst() || null;
  }

  // Get transaction history
  async getTransactionHistory(userId: number, limit: number = 50): Promise<SeedTransaction[]> {
    return await db
      .selectFrom('seed_transactions')
      .selectAll()
      .where(eb => eb.or([
        eb('from_user_id', '=', userId),
        eb('to_user_id', '=', userId)
      ]))
      .orderBy('created_at', 'desc')
      .limit(limit)
      .execute();
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