import { db } from '../db/index.js';
import { Donor, Donation, DonationLink, SeedFlowEvent } from '../db/schema.js';
import { SeedService } from './seedService.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export class DonationService {
  private seedService: SeedService;

  constructor() {
    this.seedService = new SeedService();
  }

  // Generate unique donation link
  async createDonationLink(
    type: 'PROJECT' | 'CATEGORY' | 'GENERAL',
    dreamId?: number,
    category?: string,
    customMessage?: string
  ): Promise<DonationLink> {
    const linkId = uuidv4();
    
    const link = await db
      .insertInto('donation_links')
      .values({
        link_id: linkId,
        dream_id: dreamId || null,
        category: category || null,
        link_type: type,
        custom_message: customMessage || null,
        is_active: true,
        click_count: 0,
        total_raised: 0.0,
        created_at: new Date().toISOString(),
      })
      .returning(['id', 'link_id', 'dream_id', 'category', 'link_type', 'custom_message', 'is_active', 'click_count', 'total_raised', 'created_at'])
      .executeTakeFirstOrThrow();

    console.log(`Created donation link: ${type} - ${linkId}`);
    return link;
  }

  // Register or get existing donor
  async registerDonor(email: string, name: string, preferredCurrency: string = 'USD'): Promise<Donor> {
    const existingDonor = await db
      .selectFrom('donors')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();

    if (existingDonor) {
      return existingDonor;
    }

    const donorId = uuidv4();
    const donor = await db
      .insertInto('donors')
      .values({
        email,
        name,
        donor_id: donorId,
        preferred_currency: preferredCurrency,
        total_donated: 0.0,
        total_seeds_received: 0.0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning(['id', 'email', 'name', 'donor_id', 'preferred_currency', 'total_donated', 'total_seeds_received', 'created_at', 'updated_at'])
      .executeTakeFirstOrThrow();

    console.log(`Registered new donor: ${email}`);
    return donor;
  }

  // Calculate seed conversion rate based on donation type
  private calculateConversionRate(donationType: string): number {
    switch (donationType) {
      case 'SPECIFIC_PROJECT': return 1.0; // 1:1 conversion
      case 'CATEGORY_POOL': return 1.0; // 1:1 conversion + 10% tax
      case 'GENERAL_SEEDBANK': return 0.8; // 1:0.8 conversion
      default: return 0.8;
    }
  }

  // Process donation and convert to seeds
  async processDonation(
    donorId: number,
    amount: number,
    currency: string,
    donationType: 'SPECIFIC_PROJECT' | 'CATEGORY_POOL' | 'GENERAL_SEEDBANK',
    targetDreamId?: number,
    targetCategory?: string,
    donorMessage?: string,
    paymentReference?: string
  ): Promise<Donation> {
    const donationId = uuidv4();
    const conversionRate = this.calculateConversionRate(donationType);
    const seedsGenerated = amount * conversionRate;

    return await db.transaction().execute(async (trx) => {
      // Create donation record
      const donation = await trx
        .insertInto('donations')
        .values({
          donation_id: donationId,
          donor_id: donorId,
          amount,
          currency,
          donation_type: donationType,
          target_dream_id: targetDreamId || null,
          target_category: targetCategory || null,
          seeds_generated: seedsGenerated,
          conversion_rate: conversionRate,
          status: 'CONFIRMED',
          donor_message: donorMessage || null,
          payment_reference: paymentReference || null,
          created_at: new Date().toISOString(),
          confirmed_at: new Date().toISOString(),
        })
        .returning(['id', 'donation_id', 'donor_id', 'amount', 'currency', 'donation_type', 'target_dream_id', 'target_category', 'seeds_generated', 'conversion_rate', 'status', 'donor_message', 'payment_reference', 'created_at', 'confirmed_at'])
        .executeTakeFirstOrThrow();

      // Update donor totals
      await trx
        .updateTable('donors')
        .set(eb => ({
          total_donated: eb('total_donated', '+', amount),
          total_seeds_received: eb('total_seeds_received', '+', seedsGenerated),
          updated_at: new Date().toISOString(),
        }))
        .where('id', '=', donorId)
        .execute();

      // Handle seed distribution based on donation type
      await this.distributeSeedsFromDonation(trx, donation);

      // Record seed flow event
      await this.recordSeedFlowEvent(
        trx,
        'DONATION',
        `donor:${donorId}`,
        donationType === 'SPECIFIC_PROJECT' ? `dream:${targetDreamId}` : 'seedbank',
        amount,
        seedsGenerated,
        targetDreamId || null,
        donation.donation_id
      );

      console.log(`Processed donation: ${amount} ${currency} → ${seedsGenerated} seeds`);
      return donation;
    });
  }

  // Distribute seeds based on donation type
  private async distributeSeedsFromDonation(trx: any, donation: Donation): Promise<void> {
    switch (donation.donation_type) {
      case 'SPECIFIC_PROJECT':
        if (donation.target_dream_id) {
          // Get dream creator and credit their wallet
          const dream = await trx
            .selectFrom('dreams')
            .select('user_id')
            .where('id', '=', donation.target_dream_id)
            .executeTakeFirst();

          if (dream) {
            await this.seedService.processTransaction(
              null,
              dream.user_id,
              donation.seeds_generated,
              'EARNING',
              `Donation: ${donation.donor_message || 'Supporting your dream'}`,
              donation.target_dream_id
            );
          }
        }
        break;

      case 'CATEGORY_POOL':
        // 90% to category projects, 10% to seedbank
        const categorySeeds = donation.seeds_generated * 0.9;
        const seedbankSeeds = donation.seeds_generated * 0.1;
        
        // Distribute to category projects (simplified - in reality would be more complex)
        await this.distributeToCategoryProjects(trx, donation.target_category!, categorySeeds);
        
        // 10% goes to general seedbank for auto-pollination
        break;

      case 'GENERAL_SEEDBANK':
        // 80% stays in seedbank, 20% for auto-pollination
        const pollinationSeeds = donation.seeds_generated * 0.2;
        await this.autoPollinateFromSeedbank(trx, pollinationSeeds);
        break;
    }
  }

  // Distribute seeds to projects in a category
  private async distributeToCategoryProjects(trx: any, category: string, totalSeeds: number): Promise<void> {
    // Find active dreams with matching tags
    const categoryDreams = await trx
      .selectFrom('dreams')
      .innerJoin('dream_tags', 'dream_tags.dream_id', 'dreams.id')
      .select(['dreams.id', 'dreams.user_id', 'dreams.title'])
      .where('dream_tags.tag', '=', category.toLowerCase())
      .where('dreams.is_active', '=', true)
      .execute();

    if (categoryDreams.length === 0) return;

    const seedsPerDream = totalSeeds / categoryDreams.length;

    for (const dream of categoryDreams) {
      await this.seedService.processTransaction(
        null,
        dream.user_id,
        seedsPerDream,
        'EARNING',
        `Category pool donation: ${category}`,
        dream.id
      );
    }

    console.log(`Distributed ${totalSeeds} seeds to ${categoryDreams.length} ${category} projects`);
  }

  // Auto-pollinate from seedbank to nearby projects
  private async autoPollinateFromSeedbank(trx: any, totalSeeds: number): Promise<void> {
    // Get all active dreams for auto-pollination
    const activeDreams = await trx
      .selectFrom('dreams')
      .select(['id', 'user_id', 'title'])
      .where('is_active', '=', true)
      .limit(10) // Limit to prevent overwhelming
      .execute();

    if (activeDreams.length === 0) return;

    const seedsPerDream = totalSeeds / activeDreams.length;

    for (const dream of activeDreams) {
      await this.seedService.processTransaction(
        null,
        dream.user_id,
        seedsPerDream,
        'POLLINATION',
        'Seedbank auto-pollination',
        dream.id
      );
    }

    console.log(`Auto-pollinated ${totalSeeds} seeds to ${activeDreams.length} projects`);
  }

  // Record seed flow event for transparency
  private async recordSeedFlowEvent(
    trx: any,
    eventType: string,
    fromEntity: string,
    toEntity: string,
    amount: number,
    seedsInvolved: number,
    dreamId: number | null,
    transactionHash: string
  ): Promise<void> {
    await trx
      .insertInto('seed_flow_events')
      .values({
        event_type: eventType as any,
        from_entity: fromEntity,
        to_entity: toEntity,
        amount,
        seeds_involved: seedsInvolved,
        dream_id: dreamId,
        transaction_hash: transactionHash,
        metadata: JSON.stringify({ timestamp: new Date().toISOString() }),
        created_at: new Date().toISOString(),
      })
      .execute();
  }

  // Stake seeds to a project for pollination points
  async stakeSeeds(userId: number, dreamId: number, amount: number, monthsLocked: number = 12): Promise<void> {
    const unlockDate = new Date();
    unlockDate.setMonth(unlockDate.getMonth() + monthsLocked);

    await db.transaction().execute(async (trx) => {
      // Check if user has enough seeds
      const wallet = await trx
        .selectFrom('seed_wallets')
        .select('balance')
        .where('user_id', '=', userId)
        .executeTakeFirst();

      if (!wallet || wallet.balance < amount) {
        throw new Error('Insufficient seed balance');
      }

      // Deduct seeds from wallet
      await trx
        .updateTable('seed_wallets')
        .set(eb => ({
          balance: eb('balance', '-', amount),
          updated_at: new Date().toISOString(),
        }))
        .where('user_id', '=', userId)
        .execute();

      // Create stake record
      await trx
        .insertInto('seed_stakes')
        .values({
          user_id: userId,
          dream_id: dreamId,
          amount,
          staked_at: new Date().toISOString(),
          unlock_at: unlockDate.toISOString(),
          pollination_points: 0.0,
          is_active: true,
        })
        .execute();

      // Record event
      await this.recordSeedFlowEvent(
        trx,
        'STAKE',
        `user:${userId}`,
        `dream:${dreamId}`,
        amount,
        amount,
        dreamId,
        `stake_${Date.now()}`
      );
    });

    console.log(`Staked ${amount} seeds to dream ${dreamId} for ${monthsLocked} months`);
  }

  // Get donation analytics
  async getDonationAnalytics(): Promise<any> {
    const totalDonations = await db
      .selectFrom('donations')
      .select(eb => [
        eb.fn.sum('amount').as('total_amount'),
        eb.fn.sum('seeds_generated').as('total_seeds'),
        eb.fn.count('id').as('donation_count'),
      ])
      .where('status', '=', 'CONFIRMED')
      .executeTakeFirst();

    const flowEvents = await db
      .selectFrom('seed_flow_events')
      .select(['event_type', 'seeds_involved', 'created_at'])
      .orderBy('created_at', 'desc')
      .limit(100)
      .execute();

    const activeDreams = await db
      .selectFrom('dreams')
      .select(eb => eb.fn.count('id').as('count'))
      .where('is_active', '=', true)
      .executeTakeFirst();

    return {
      total_donated: totalDonations?.total_amount || 0,
      total_seeds_generated: totalDonations?.total_seeds || 0,
      donation_count: totalDonations?.donation_count || 0,
      active_projects: activeDreams?.count || 0,
      recent_flow: flowEvents,
      conversion_efficiency: totalDonations?.total_amount ? 
        (totalDonations.total_seeds / totalDonations.total_amount * 100).toFixed(1) + '%' : '0%'
    };
  }

  // Get donor's impact summary
  async getDonorImpact(donorId: number): Promise<any> {
    const donor = await db
      .selectFrom('donors')
      .selectAll()
      .where('id', '=', donorId)
      .executeTakeFirst();

    if (!donor) return null;

    const donations = await db
      .selectFrom('donations')
      .selectAll()
      .where('donor_id', '=', donorId)
      .where('status', '=', 'CONFIRMED')
      .orderBy('created_at', 'desc')
      .execute();

    const supportedDreams = await db
      .selectFrom('donations')
      .innerJoin('dreams', 'dreams.id', 'donations.target_dream_id')
      .select(['dreams.id', 'dreams.title', 'dreams.phase'])
      .where('donations.donor_id', '=', donorId)
      .where('donations.target_dream_id', 'is not', null)
      .groupBy(['dreams.id', 'dreams.title', 'dreams.phase'])
      .execute();

    return {
      donor,
      donations,
      supported_dreams: supportedDreams,
      impact_summary: {
        total_donated: donor.total_donated,
        seeds_generated: donor.total_seeds_received,
        projects_supported: supportedDreams.length,
        latest_donation: donations[0]?.created_at
      }
    };
  }
}