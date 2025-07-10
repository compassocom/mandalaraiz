import { db } from '../db/index.js';
import { UserTokens, TokenTransaction, SystemConfig } from '../db/schema.js';

export class TokenService {
  private systemConfig: Map<string, string> = new Map();

  constructor() {
    this.loadSystemConfig();
  }

  private async loadSystemConfig(): Promise<void> {
    try {
      const configs = await db
        .selectFrom('system_config')
        .selectAll()
        .execute();

      configs.forEach(config => {
        this.systemConfig.set(config.config_key, config.config_value);
      });
    } catch (error) {
      console.error('Error loading system config:', error);
    }
  }

  private getConfig(key: string, defaultValue: string = '0'): number {
    return parseFloat(this.systemConfig.get(key) || defaultValue);
  }

  // Initialize user tokens wallet
  async initializeUserTokens(userId: number): Promise<UserTokens> {
    const tokens = await db
      .insertInto('user_tokens')
      .values({
        user_id: userId,
        seeds_balance: 0.0,
        roots_balance: 0.0,
        total_seeds_earned: 0.0,
        total_roots_earned: 0.0,
        last_daily_reward: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning(['id', 'user_id', 'seeds_balance', 'roots_balance', 'total_seeds_earned', 'total_roots_earned', 'last_daily_reward', 'created_at', 'updated_at'])
      .executeTakeFirstOrThrow();

    console.log(`Initialized token wallet for user ${userId}`);
    return tokens;
  }

  // Get user tokens balance
  async getUserTokens(userId: number): Promise<UserTokens | null> {
    let tokens = await db
      .selectFrom('user_tokens')
      .selectAll()
      .where('user_id', '=', userId)
      .executeTakeFirst();

    if (!tokens) {
      tokens = await this.initializeUserTokens(userId);
    }

    return tokens;
  }

  // Check if user can earn daily Seeds
  async canEarnDailySeeds(userId: number): Promise<{ canEarn: boolean; seedsEarnedToday: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const seedsEarnedToday = await db
      .selectFrom('token_transactions')
      .select(eb => eb.fn.sum('amount').as('total'))
      .where('user_id', '=', userId)
      .where('transaction_type', '=', 'EARN_SEEDS')
      .where('created_at', '>=', today.toISOString())
      .executeTakeFirst();

    const dailyCap = this.getConfig('DAILY_SEEDS_CAP', '100');
    const earned = parseFloat(seedsEarnedToday?.total as string || '0');

    return {
      canEarn: earned < dailyCap,
      seedsEarnedToday: earned
    };
  }

  // Award Seeds to user with daily cap protection
  async awardSeeds(userId: number, amount: number, description: string): Promise<boolean> {
    const { canEarn, seedsEarnedToday } = await this.canEarnDailySeeds(userId);
    const dailyCap = this.getConfig('DAILY_SEEDS_CAP', '100');
    
    if (!canEarn) {
      console.log(`User ${userId} has reached daily Seeds cap (${dailyCap})`);
      return false;
    }

    // Limit amount to not exceed daily cap
    const maxAward = dailyCap - seedsEarnedToday;
    const actualAmount = Math.min(amount, maxAward);

    if (actualAmount <= 0) {
      return false;
    }

    return await db.transaction().execute(async (trx) => {
      // Add Seeds to balance
      await trx
        .updateTable('user_tokens')
        .set(eb => ({
          seeds_balance: eb('seeds_balance', '+', actualAmount),
          total_seeds_earned: eb('total_seeds_earned', '+', actualAmount),
          updated_at: new Date().toISOString(),
        }))
        .where('user_id', '=', userId)
        .execute();

      // Record transaction
      await trx
        .insertInto('token_transactions')
        .values({
          user_id: userId,
          transaction_type: 'EARN_SEEDS',
          amount: actualAmount,
          token_type: 'SEEDS',
          description,
          burn_amount: 0.0,
          fee_amount: 0.0,
          created_at: new Date().toISOString(),
        })
        .execute();

      console.log(`Awarded ${actualAmount} Seeds to user ${userId}: ${description}`);
      return true;
    });
  }

  // Convert Seeds to Roots with burn mechanism
  async convertSeedsToRoots(userId: number, seedsAmount: number): Promise<{ success: boolean; rootsReceived?: number; seedsBurned?: number }> {
    const userTokens = await this.getUserTokens(userId);
    if (!userTokens || userTokens.seeds_balance < seedsAmount) {
      return { success: false };
    }

    const conversionRate = this.getConfig('SEEDS_TO_ROOTS_RATE', '100'); // 100 Seeds = 1 Root
    const burnPercentage = this.getConfig('BURN_PERCENTAGE', '10') / 100; // 10%

    const seedsBurned = seedsAmount * burnPercentage;
    const seedsForConversion = seedsAmount - seedsBurned;
    const rootsReceived = seedsForConversion / conversionRate;

    return await db.transaction().execute(async (trx) => {
      // Update user balances
      await trx
        .updateTable('user_tokens')
        .set(eb => ({
          seeds_balance: eb('seeds_balance', '-', seedsAmount),
          roots_balance: eb('roots_balance', '+', rootsReceived),
          total_roots_earned: eb('total_roots_earned', '+', rootsReceived),
          updated_at: new Date().toISOString(),
        }))
        .where('user_id', '=', userId)
        .execute();

      // Record burn transaction
      await trx
        .insertInto('token_transactions')
        .values({
          user_id: userId,
          transaction_type: 'BURN_SEEDS',
          amount: seedsBurned,
          token_type: 'SEEDS',
          description: 'Burned during Seeds to Roots conversion',
          burn_amount: seedsBurned,
          fee_amount: 0.0,
          created_at: new Date().toISOString(),
        })
        .execute();

      // Record conversion transaction
      await trx
        .insertInto('token_transactions')
        .values({
          user_id: userId,
          transaction_type: 'CONVERT_TO_ROOTS',
          amount: rootsReceived,
          token_type: 'ROOTS',
          description: `Converted ${seedsForConversion} Seeds to Roots`,
          burn_amount: 0.0,
          fee_amount: 0.0,
          created_at: new Date().toISOString(),
        })
        .execute();

      console.log(`Converted ${seedsAmount} Seeds to ${rootsReceived} Roots for user ${userId} (burned ${seedsBurned})`);
      return { success: true, rootsReceived, seedsBurned };
    });
  }

  // Transfer Seeds between users with burn
  async transferSeeds(fromUserId: number, toUserId: number, amount: number, description: string): Promise<{ success: boolean; amountTransferred?: number; burnAmount?: number }> {
    const fromTokens = await this.getUserTokens(fromUserId);
    if (!fromTokens || fromTokens.seeds_balance < amount) {
      return { success: false };
    }

    const burnPercentage = this.getConfig('BURN_PERCENTAGE', '10') / 100;
    const burnAmount = amount * burnPercentage;
    const transferAmount = amount - burnAmount;

    return await db.transaction().execute(async (trx) => {
      // Deduct from sender
      await trx
        .updateTable('user_tokens')
        .set(eb => ({
          seeds_balance: eb('seeds_balance', '-', amount),
          updated_at: new Date().toISOString(),
        }))
        .where('user_id', '=', fromUserId)
        .execute();

      // Add to receiver
      await trx
        .updateTable('user_tokens')
        .set(eb => ({
          seeds_balance: eb('seeds_balance', '+', transferAmount),
          updated_at: new Date().toISOString(),
        }))
        .where('user_id', '=', toUserId)
        .execute();

      // Record burn transaction
      await trx
        .insertInto('token_transactions')
        .values({
          user_id: fromUserId,
          transaction_type: 'BURN_SEEDS',
          amount: burnAmount,
          token_type: 'SEEDS',
          description: `Burned during transfer to user ${toUserId}`,
          burn_amount: burnAmount,
          fee_amount: 0.0,
          created_at: new Date().toISOString(),
        })
        .execute();

      console.log(`Transferred ${transferAmount} Seeds from user ${fromUserId} to ${toUserId} (burned ${burnAmount})`);
      return { success: true, amountTransferred: transferAmount, burnAmount };
    });
  }

  // Get user transaction history
  async getUserTransactionHistory(userId: number, limit: number = 50): Promise<TokenTransaction[]> {
    return await db
      .selectFrom('token_transactions')
      .selectAll()
      .where('user_id', '=', userId)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .execute();
  }

  // Get system token statistics
  async getTokenStatistics() {
    const totalSeeds = await db
      .selectFrom('user_tokens')
      .select(eb => eb.fn.sum('seeds_balance').as('total'))
      .executeTakeFirst();

    const totalRoots = await db
      .selectFrom('user_tokens')
      .select(eb => eb.fn.sum('roots_balance').as('total'))
      .executeTakeFirst();

    const totalBurned = await db
      .selectFrom('token_transactions')
      .select(eb => eb.fn.sum('burn_amount').as('total'))
      .where('transaction_type', '=', 'BURN_SEEDS')
      .executeTakeFirst();

    return {
      total_seeds_in_circulation: parseFloat(totalSeeds?.total as string || '0'),
      total_roots_in_circulation: parseFloat(totalRoots?.total as string || '0'),
      total_seeds_burned: parseFloat(totalBurned?.total as string || '0'),
      seeds_to_roots_rate: this.getConfig('SEEDS_TO_ROOTS_RATE'),
      daily_seeds_cap: this.getConfig('DAILY_SEEDS_CAP'),
      burn_percentage: this.getConfig('BURN_PERCENTAGE')
    };
  }
}
