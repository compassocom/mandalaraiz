import { db } from '../db/index.js';
import { MarketplaceListing, MarketplaceTransaction, UserRating } from '../db/schema.js';
import { TokenService } from './tokenService.js';

export class MarketplaceService {
  private tokenService: TokenService;

  constructor() {
    this.tokenService = new TokenService();
  }

  // Create a new marketplace listing
  async createListing(listingData: Omit<MarketplaceListing, 'id' | 'is_active' | 'is_approved' | 'view_count' | 'created_at' | 'updated_at'>): Promise<MarketplaceListing> {
    const listing = await db
      .insertInto('marketplace_listings')
      .values({
        ...listingData,
        is_active: true,
        is_approved: false, // Requires approval
        view_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning(['id', 'seller_id', 'title', 'description', 'price_seeds', 'category', 'subcategory', 'location_lat', 'location_lng', 'location_text', 'images', 'is_active', 'is_approved', 'view_count', 'created_at', 'updated_at'])
      .executeTakeFirstOrThrow();

    console.log(`Created marketplace listing ${listing.id}: ${listing.title}`);
    return listing;
  }

  // Get marketplace listings with filters
  async getListings(filters: {
    category?: string;
    location?: { lat: number; lng: number; radius: number };
    priceRange?: { min: number; max: number };
    searchTerm?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ listings: MarketplaceListing[]; total: number }> {
    let query = db
      .selectFrom('marketplace_listings')
      .selectAll()
      .where('is_active', '=', true)
      .where('is_approved', '=', true);

    // Apply filters
    if (filters.category) {
      query = query.where('category', '=', filters.category as any);
    }

    if (filters.priceRange) {
      query = query
        .where('price_seeds', '>=', filters.priceRange.min)
        .where('price_seeds', '<=', filters.priceRange.max);
    }

    if (filters.searchTerm) {
      query = query.where(eb => 
        eb.or([
          eb('title', 'like', `%${filters.searchTerm}%`),
          eb('description', 'like', `%${filters.searchTerm}%`)
        ])
      );
    }

    // Get total count
    const totalResult = await query
      .select(eb => eb.fn.count('id').as('count'))
      .executeTakeFirst();
    const total = parseInt(totalResult?.count as string || '0');

    // Get listings with pagination
    const listings = await query
      .orderBy('created_at', 'desc')
      .limit(filters.limit || 20)
      .offset(filters.offset || 0)
      .execute();

    return { listings, total };
  }

  // Get listing details with seller info
  async getListingDetails(listingId: number): Promise<any> {
    const listing = await db
      .selectFrom('marketplace_listings')
      .leftJoin('users', 'users.id', 'marketplace_listings.seller_id')
      .leftJoin('user_ratings', 'user_ratings.user_id', 'marketplace_listings.seller_id')
      .select([
        'marketplace_listings.id',
        'marketplace_listings.title',
        'marketplace_listings.description',
        'marketplace_listings.price_seeds',
        'marketplace_listings.category',
        'marketplace_listings.subcategory',
        'marketplace_listings.location_text',
        'marketplace_listings.images',
        'marketplace_listings.view_count',
        'marketplace_listings.created_at',
        'users.name as seller_name',
        'users.email as seller_email',
        'user_ratings.seller_rating',
        'user_ratings.total_sales',
        'user_ratings.seller_reviews_count'
      ])
      .where('marketplace_listings.id', '=', listingId)
      .where('marketplace_listings.is_active', '=', true)
      .where('marketplace_listings.is_approved', '=', true)
      .executeTakeFirst();

    if (listing) {
      // Increment view count
      await db
        .updateTable('marketplace_listings')
        .set(eb => ({
          view_count: eb('view_count', '+', 1),
          updated_at: new Date().toISOString()
        }))
        .where('id', '=', listingId)
        .execute();
    }

    return listing;
  }

  // Purchase an item from marketplace
  async purchaseItem(listingId: number, buyerId: number): Promise<{ success: boolean; transaction?: MarketplaceTransaction; message?: string }> {
    const listing = await db
      .selectFrom('marketplace_listings')
      .selectAll()
      .where('id', '=', listingId)
      .where('is_active', '=', true)
      .where('is_approved', '=', true)
      .executeTakeFirst();

    if (!listing) {
      return { success: false, message: 'Listing not found or not available' };
    }

    if (listing.seller_id === buyerId) {
      return { success: false, message: 'Cannot purchase your own listing' };
    }

    // Check buyer has enough Seeds
    const buyerTokens = await this.tokenService.getUserTokens(buyerId);
    if (!buyerTokens || buyerTokens.seeds_balance < listing.price_seeds) {
      return { success: false, message: 'Insufficient Seeds balance' };
    }

    const feePercentage = 0.05; // 5% marketplace fee
    const feeSeeds = listing.price_seeds * feePercentage;
    const sellerReceives = listing.price_seeds - feeSeeds;

    return await db.transaction().execute(async (trx) => {
      // Deduct Seeds from buyer
      await trx
        .updateTable('user_tokens')
        .set(eb => ({
          seeds_balance: eb('seeds_balance', '-', listing.price_seeds),
          updated_at: new Date().toISOString(),
        }))
        .where('user_id', '=', buyerId)
        .execute();

      // Add Seeds to seller
      await trx
        .updateTable('user_tokens')
        .set(eb => ({
          seeds_balance: eb('seeds_balance', '+', sellerReceives),
          updated_at: new Date().toISOString(),
        }))
        .where('user_id', '=', listing.seller_id)
        .execute();

      // Record buyer transaction
      await trx
        .insertInto('token_transactions')
        .values({
          user_id: buyerId,
          transaction_type: 'MARKETPLACE_BUY',
          amount: listing.price_seeds,
          token_type: 'SEEDS',
          description: `Purchased: ${listing.title}`,
          burn_amount: 0.0,
          fee_amount: feeSeeds,
          created_at: new Date().toISOString(),
        })
        .execute();

      // Record seller transaction
      await trx
        .insertInto('token_transactions')
        .values({
          user_id: listing.seller_id,
          transaction_type: 'MARKETPLACE_SELL',
          amount: sellerReceives,
          token_type: 'SEEDS',
          description: `Sold: ${listing.title}`,
          burn_amount: 0.0,
          fee_amount: feeSeeds,
          created_at: new Date().toISOString(),
        })
        .execute();

      // Create marketplace transaction record
      const transaction = await trx
        .insertInto('marketplace_transactions')
        .values({
          listing_id: listingId,
          buyer_id: buyerId,
          seller_id: listing.seller_id,
          price_seeds: listing.price_seeds,
          fee_seeds: feeSeeds,
          seller_receives_seeds: sellerReceives,
          status: 'COMPLETED',
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        })
        .returning(['id', 'listing_id', 'buyer_id', 'seller_id', 'price_seeds', 'fee_seeds', 'seller_receives_seeds', 'status', 'buyer_rating', 'seller_rating', 'buyer_review', 'seller_review', 'created_at', 'completed_at'])
        .executeTakeFirstOrThrow();

      // Mark listing as sold (deactivate)
      await trx
        .updateTable('marketplace_listings')
        .set({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .where('id', '=', listingId)
        .execute();

      console.log(`Marketplace purchase completed: ${listing.title} bought by user ${buyerId}`);
      return { success: true, transaction };
    });
  }

  // Rate a transaction
  async rateTransaction(transactionId: number, userId: number, rating: number, review?: string): Promise<boolean> {
    const transaction = await db
      .selectFrom('marketplace_transactions')
      .selectAll()
      .where('id', '=', transactionId)
      .where('status', '=', 'COMPLETED')
      .executeTakeFirst();

    if (!transaction) {
      return false;
    }

    const isBuyer = transaction.buyer_id === userId;
    const isSeller = transaction.seller_id === userId;

    if (!isBuyer && !isSeller) {
      return false;
    }

    return await db.transaction().execute(async (trx) => {
      // Update transaction with rating
      if (isBuyer) {
        await trx
          .updateTable('marketplace_transactions')
          .set({
            seller_rating: rating,
            seller_review: review || null
          })
          .where('id', '=', transactionId)
          .execute();

        // Update seller's rating stats
        await this.updateUserRating(trx, transaction.seller_id, 'seller', rating);
      } else {
        await trx
          .updateTable('marketplace_transactions')
          .set({
            buyer_rating: rating,
            buyer_review: review || null
          })
          .where('id', '=', transactionId)
          .execute();

        // Update buyer's rating stats
        await this.updateUserRating(trx, transaction.buyer_id, 'buyer', rating);
      }

      return true;
    });
  }

  // Update user rating statistics
  private async updateUserRating(trx: any, userId: number, ratingType: 'buyer' | 'seller', newRating: number): Promise<void> {
    const userRating = await trx
      .selectFrom('user_ratings')
      .selectAll()
      .where('user_id', '=', userId)
      .executeTakeFirst();

    if (!userRating) {
      // Create new rating record
      await trx
        .insertInto('user_ratings')
        .values({
          user_id: userId,
          seller_rating: ratingType === 'seller' ? newRating : 0.0,
          buyer_rating: ratingType === 'buyer' ? newRating : 0.0,
          total_sales: ratingType === 'seller' ? 1 : 0,
          total_purchases: ratingType === 'buyer' ? 1 : 0,
          seller_reviews_count: ratingType === 'seller' ? 1 : 0,
          buyer_reviews_count: ratingType === 'buyer' ? 1 : 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .execute();
    } else {
      // Update existing rating
      if (ratingType === 'seller') {
        const newAverage = ((userRating.seller_rating * userRating.seller_reviews_count) + newRating) / (userRating.seller_reviews_count + 1);
        await trx
          .updateTable('user_ratings')
          .set({
            seller_rating: newAverage,
            total_sales: userRating.total_sales + 1,
            seller_reviews_count: userRating.seller_reviews_count + 1,
            updated_at: new Date().toISOString(),
          })
          .where('user_id', '=', userId)
          .execute();
      } else {
        const newAverage = ((userRating.buyer_rating * userRating.buyer_reviews_count) + newRating) / (userRating.buyer_reviews_count + 1);
        await trx
          .updateTable('user_ratings')
          .set({
            buyer_rating: newAverage,
            total_purchases: userRating.total_purchases + 1,
            buyer_reviews_count: userRating.buyer_reviews_count + 1,
            updated_at: new Date().toISOString(),
          })
          .where('user_id', '=', userId)
          .execute();
      }
    }
  }

  // Get user's marketplace history
  async getUserMarketplaceHistory(userId: number): Promise<{ purchases: any[]; sales: any[]; listings: any[] }> {
    const purchases = await db
      .selectFrom('marketplace_transactions')
      .leftJoin('marketplace_listings', 'marketplace_listings.id', 'marketplace_transactions.listing_id')
      .select([
        'marketplace_transactions.id',
        'marketplace_transactions.price_seeds',
        'marketplace_transactions.status',
        'marketplace_transactions.created_at',
        'marketplace_listings.title',
        'marketplace_listings.category'
      ])
      .where('marketplace_transactions.buyer_id', '=', userId)
      .orderBy('marketplace_transactions.created_at', 'desc')
      .execute();

    const sales = await db
      .selectFrom('marketplace_transactions')
      .leftJoin('marketplace_listings', 'marketplace_listings.id', 'marketplace_transactions.listing_id')
      .select([
        'marketplace_transactions.id',
        'marketplace_transactions.seller_receives_seeds',
        'marketplace_transactions.status',
        'marketplace_transactions.created_at',
        'marketplace_listings.title',
        'marketplace_listings.category'
      ])
      .where('marketplace_transactions.seller_id', '=', userId)
      .orderBy('marketplace_transactions.created_at', 'desc')
      .execute();

    const listings = await db
      .selectFrom('marketplace_listings')
      .selectAll()
      .where('seller_id', '=', userId)
      .orderBy('created_at', 'desc')
      .execute();

    return { purchases, sales, listings };
  }
}
