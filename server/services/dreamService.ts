import { db } from '../db/index.js';
import { Dream, DreamTag } from '../db/schema.js';

export class DreamService {
  // Calculate distance between two points in kilometers
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

  // Find nearby dreams within visibility radius
  async findNearbyDreams(lat: number, lng: number, maxRadius: number = 2000): Promise<Dream[]> {
    console.log(`Finding dreams near ${lat}, ${lng} within ${maxRadius}m`);
    
    const dreams = await db
      .selectFrom('dreams')
      .selectAll()
      .where('is_active', '=', true)
      .execute();

    const nearbyDreams = dreams.filter(dream => {
      const distance = this.calculateDistance(lat, lng, dream.location_lat, dream.location_lng);
      return distance * 1000 <= Math.min(dream.visibility_radius, maxRadius);
    });

    console.log(`Found ${nearbyDreams.length} nearby dreams`);
    return nearbyDreams;
  }

  // Calculate similarity between dreams based on tags
  async calculateDreamSimilarity(dreamId1: number, dreamId2: number): Promise<number> {
    const tags1 = await db
      .selectFrom('dream_tags')
      .select('tag')
      .where('dream_id', '=', dreamId1)
      .execute();

    const tags2 = await db
      .selectFrom('dream_tags')
      .select('tag')
      .where('dream_id', '=', dreamId2)
      .execute();

    const tagSet1 = new Set(tags1.map(t => t.tag.toLowerCase()));
    const tagSet2 = new Set(tags2.map(t => t.tag.toLowerCase()));

    const intersection = new Set([...tagSet1].filter(tag => tagSet2.has(tag)));
    const union = new Set([...tagSet1, ...tagSet2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  // Find matching dreams based on similarity
  async findMatchingDreams(dreamId: number, threshold: number = 0.3): Promise<Dream[]> {
    const targetDream = await db
      .selectFrom('dreams')
      .selectAll()
      .where('id', '=', dreamId)
      .executeTakeFirst();

    if (!targetDream) return [];

    const nearbyDreams = await this.findNearbyDreams(
      targetDream.location_lat,
      targetDream.location_lng,
      targetDream.visibility_radius
    );

    const matches = [];
    for (const dream of nearbyDreams) {
      if (dream.id === dreamId) continue;
      
      const similarity = await this.calculateDreamSimilarity(dreamId, dream.id);
      if (similarity >= threshold) {
        matches.push(dream);
      }
    }

    console.log(`Found ${matches.length} matching dreams for dream ${dreamId}`);
    return matches;
  }

  // Create new dream with tags
  async createDream(dreamData: Omit<Dream, 'id' | 'created_at' | 'updated_at'>, tags: string[]): Promise<Dream> {
    const dream = await db
      .insertInto('dreams')
      .values({
        ...dreamData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning(['id', 'title', 'description', 'user_id', 'location_lat', 'location_lng', 'visibility_radius', 'phase', 'participant_limit', 'activation_threshold', 'is_active', 'created_at', 'updated_at'])
      .executeTakeFirstOrThrow();

    // Add tags
    if (tags.length > 0) {
      await db
        .insertInto('dream_tags')
        .values(tags.map(tag => ({ dream_id: dream.id, tag: tag.toLowerCase() })))
        .execute();
    }

    console.log(`Created dream ${dream.id}: ${dream.title}`);
    return dream;
  }

  // Get dream with tags and participants
  async getDreamDetails(dreamId: number) {
    const dream = await db
      .selectFrom('dreams')
      .selectAll()
      .where('id', '=', dreamId)
      .executeTakeFirst();

    if (!dream) return null;

    const tags = await db
      .selectFrom('dream_tags')
      .select('tag')
      .where('dream_id', '=', dreamId)
      .execute();

    const participants = await db
      .selectFrom('dream_participants')
      .innerJoin('users', 'users.id', 'dream_participants.user_id')
      .select(['users.id', 'users.name', 'users.email', 'dream_participants.joined_at'])
      .where('dream_participants.dream_id', '=', dreamId)
      .execute();

    return {
      ...dream,
      tags: tags.map(t => t.tag),
      participants
    };
  }

  // Check if dream can be activated
  async checkActivationThreshold(dreamId: number): Promise<boolean> {
    const dream = await db
      .selectFrom('dreams')
      .select(['activation_threshold'])
      .where('id', '=', dreamId)
      .executeTakeFirst();

    if (!dream) return false;

    const participantCount = await db
      .selectFrom('dream_participants')
      .where('dream_id', '=', dreamId)
      .execute();

    return participantCount.length >= dream.activation_threshold;
  }
}