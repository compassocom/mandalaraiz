import { db } from '../db/index.js';
import { Dream, DreamTag } from '../db/schema.js';
import { sql } from 'kysely';

export class DreamService {
  constructor() {
    console.log('DreamService initialized');
  }

  // Create a new dream with tags
  async createDream(dreamData: Omit<Dream, 'id' | 'created_at' | 'updated_at'>, tags: string[] = []): Promise<Dream> {
    const dream = await db
      .insertInto('dreams')
      .values({
        ...dreamData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returningAll()
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

  // --- FUNÇÃO CORRIGIDA ---
  // Find nearby dreams within a given radius using a raw SQL query for performance
  async findNearbyDreams(lat: number, lng: number, radiusMeters: number = 2000): Promise<any[]> {
    // Esta query usa a fórmula de Haversine diretamente no Postgres para calcular
    // a distância e filtrar os resultados de forma eficiente.
    const dreams = await sql<any>`
      SELECT 
        d.id, d.title, d.description, d.location_lat, d.location_lng,
        d.phase, d.participant_limit, d.is_active,
        (
          6371000 * acos(
            cos(radians(${lat})) * cos(radians(d.location_lat)) *
            cos(radians(d.location_lng) - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(d.location_lat))
          )
        ) AS distance
      FROM dreams d
      WHERE d.is_active = true
      HAVING (
        6371000 * acos(
          cos(radians(${lat})) * cos(radians(d.location_lat)) *
          cos(radians(d.location_lng) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(d.location_lat))
        )
      ) <= ${radiusMeters}
      ORDER BY distance;
    `.execute(db);

    console.log(`Found ${dreams.rows.length} dreams within ${radiusMeters}m of (${lat}, ${lng})`);
    return dreams.rows;
  }


  // Get detailed dream information
  async getDreamDetails(dreamId: number): Promise<any | null> {
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

    // Get participants
    const participants = await db
      .selectFrom('dream_participants')
      .innerJoin('users', 'dream_participants.user_id', 'users.id')
      .select(['users.id', 'users.name', 'users.email', 'dream_participants.joined_at'])
      .where('dream_id', '=', dreamId)
      .execute();

    return {
      ...dream,
      tags: tags.map(t => t.tag),
      participants: participants
    };
  }

  // As funções de ajuda para cálculo em JS já não são necessárias para a busca,
  // mas podem ser úteis noutros locais.
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
