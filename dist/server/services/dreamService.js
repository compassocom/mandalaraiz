import { db } from '../db/index.js';
export class DreamService {
    constructor() {
        console.log('DreamService initialized');
    }
    // Create a new dream with tags
    async createDream(dreamData, tags = []) {
        const dream = await db
            .insertInto('dreams')
            .values({
            ...dreamData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
            .returning(['id', 'user_id', 'title', 'description', 'location_lat', 'location_lng', 'visibility_radius', 'phase', 'participant_limit', 'activation_threshold', 'is_active', 'created_at', 'updated_at'])
            .executeTakeFirstOrThrow();
        // Add tags if provided
        if (tags.length > 0) {
            const tagData = tags.map(tag => ({
                dream_id: dream.id,
                tag: tag.toLowerCase().trim()
            }));
            await db
                .insertInto('dream_tags')
                .values(tagData)
                .execute();
        }
        console.log(`Created dream ${dream.id}: ${dream.title}`);
        return dream;
    }
    // Find nearby dreams within a given radius
    async findNearbyDreams(lat, lng, radiusMeters = 2000) {
        // Simple distance calculation using Haversine formula approximation
        const dreams = await db
            .selectFrom('dreams')
            .leftJoin('users', 'dreams.user_id', 'users.id')
            .leftJoin('dream_tags', 'dreams.id', 'dream_tags.dream_id')
            .select([
            'dreams.id',
            'dreams.title',
            'dreams.description',
            'dreams.location_lat',
            'dreams.location_lng',
            'dreams.phase',
            'dreams.participant_limit',
            'dreams.activation_threshold',
            'dreams.is_active',
            'dreams.created_at',
            'users.name as creator_name',
            'dream_tags.tag'
        ])
            .where('dreams.is_active', '=', true)
            .execute();
        // Filter by distance and group tags
        const dreamsWithDistance = dreams.map(dream => {
            const distance = this.calculateDistance(lat, lng, dream.location_lat, dream.location_lng);
            return { ...dream, distance };
        }).filter(dream => dream.distance <= radiusMeters);
        // Group by dream and collect tags
        const dreamMap = new Map();
        dreamsWithDistance.forEach(dream => {
            if (!dreamMap.has(dream.id)) {
                dreamMap.set(dream.id, {
                    ...dream,
                    tags: []
                });
            }
            if (dream.tag) {
                dreamMap.get(dream.id).tags.push(dream.tag);
            }
        });
        const result = Array.from(dreamMap.values()).sort((a, b) => a.distance - b.distance);
        console.log(`Found ${result.length} dreams within ${radiusMeters}m of (${lat}, ${lng})`);
        return result;
    }
    // Get detailed dream information
    async getDreamDetails(dreamId) {
        const dream = await db
            .selectFrom('dreams')
            .leftJoin('users', 'dreams.user_id', 'users.id')
            .select([
            'dreams.id',
            'dreams.user_id',
            'dreams.title',
            'dreams.description',
            'dreams.location_lat',
            'dreams.location_lng',
            'dreams.visibility_radius',
            'dreams.phase',
            'dreams.participant_limit',
            'dreams.activation_threshold',
            'dreams.is_active',
            'dreams.created_at',
            'dreams.updated_at',
            'users.name as creator_name'
        ])
            .where('dreams.id', '=', dreamId)
            .executeTakeFirst();
        if (!dream) {
            return null;
        }
        // Get tags
        const tags = await db
            .selectFrom('dream_tags')
            .select(['tag'])
            .where('dream_id', '=', dreamId)
            .execute();
        // Get participants count
        const participantCount = await db
            .selectFrom('dream_participants')
            .select((eb) => eb.fn.countAll().as('count'))
            .where('dream_id', '=', dreamId)
            .executeTakeFirst();
        return {
            ...dream,
            tags: tags.map(t => t.tag),
            participant_count: Number(participantCount?.count || 0)
        };
    }
    // Helper function to calculate distance between two points
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371000; // Earth's radius in meters
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
}
