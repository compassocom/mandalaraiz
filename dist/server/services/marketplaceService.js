import { db } from '../db/index.js';
export class MarketplaceService {
    constructor() {
        console.log('MarketplaceService initialized');
    }
    // Create a new marketplace listing
    async createListing(listingData) {
        const listing = await db
            .insertInto('marketplace_listings')
            .values({
            ...listingData,
            is_active: true,
            is_approved: true, // Auto-approve for demo
            view_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
            .returning(['id', 'seller_id', 'title', 'description', 'category', 'subcategory', 'location_lat', 'location_lng', 'location_text', 'images', 'is_active', 'is_approved', 'view_count', 'created_at', 'updated_at'])
            .executeTakeFirstOrThrow();
        console.log(`Created marketplace listing ${listing.id}: ${listing.title}`);
        return listing;
    }
    // Get marketplace listings with filters
    async getListings(filters = {}) {
        let query = db
            .selectFrom('marketplace_listings')
            .leftJoin('users', 'users.id', 'marketplace_listings.seller_id')
            .select([
            'marketplace_listings.id',
            'marketplace_listings.title',
            'marketplace_listings.description',
            'marketplace_listings.category',
            'marketplace_listings.location_lat',
            'marketplace_listings.location_lng',
            'marketplace_listings.location_text',
            'marketplace_listings.images',
            'marketplace_listings.view_count',
            'marketplace_listings.created_at',
            'users.name as seller_name'
        ])
            .where('marketplace_listings.is_active', '=', true)
            .where('marketplace_listings.is_approved', '=', true);
        // Apply filters
        if (filters.category) {
            query = query.where('marketplace_listings.category', '=', filters.category);
        }
        if (filters.searchTerm) {
            const searchTerm = `%${filters.searchTerm}%`;
            query = query.where((eb) => eb.or([
                eb('marketplace_listings.title', 'like', searchTerm),
                eb('marketplace_listings.description', 'like', searchTerm)
            ]));
        }
        // Get total count first
        const countQuery = db
            .selectFrom('marketplace_listings')
            .select((eb) => eb.fn.countAll().as('count'))
            .where('marketplace_listings.is_active', '=', true)
            .where('marketplace_listings.is_approved', '=', true);
        if (filters.category) {
            countQuery.where('marketplace_listings.category', '=', filters.category);
        }
        if (filters.searchTerm) {
            const searchTerm = `%${filters.searchTerm}%`;
            countQuery.where((eb) => eb.or([
                eb('marketplace_listings.title', 'like', searchTerm),
                eb('marketplace_listings.description', 'like', searchTerm)
            ]));
        }
        const countResult = await countQuery.executeTakeFirst();
        const total = Number(countResult?.count || 0);
        // Get listings with pagination
        const listings = await query
            .orderBy('marketplace_listings.created_at', 'desc')
            .limit(filters.limit || 20)
            .offset(filters.offset || 0)
            .execute();
        console.log(`Found ${listings.length} marketplace listings (total: ${total})`);
        return { listings, total };
    }
}
