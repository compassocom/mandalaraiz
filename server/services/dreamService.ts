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
  // Encontra sonhos próximos usando a base de dados para o cálculo de distância
  async findNearbyDreams(lat: number, lng: number, radiusMeters: number = 2000): Promise<any[]> {
    // Esta expressão Kysely injeta SQL puro para o cálculo da distância (fórmula de Haversine),
    // permitindo que a base de dados faça a filtragem de forma eficiente.
    const distanceExpression = sql<number>`
        (
          6371000 * acos(
            cos(radians(${lat})) * cos(radians(dreams.location_lat)) *
            cos(radians(dreams.location_lng) - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(dreams.location_lat))
          )
        )
    `;

    const dreamsWithTags = await db
      .selectFrom('dreams')
      .leftJoin('dream_tags', 'dreams.id', 'dream_tags.dream_id')
      .selectAll('dreams')
      .select('dream_tags.tag')
      .select(distanceExpression.as('distance'))
      .where('dreams.is_active', '=', true)
      .where(distanceExpression, '<=', radiusMeters)
      .orderBy('distance')
      .execute();

    // Agrupa os resultados por sonho para agregar as tags,
    // tal como a lógica original fazia, mas após a filtragem eficiente na base de dados.
    const dreamMap = new Map();
    dreamsWithTags.forEach(dream => {
      if (!dreamMap.has(dream.id)) {
        // Remove a propriedade 'tag' individual para evitar confusão
        const { tag, ...dreamData } = dream;
        dreamMap.set(dream.id, {
          ...dreamData,
          tags: []
        });
      }
      if (dream.tag) {
        dreamMap.get(dream.id).tags.push(dream.tag);
      }
    });

    const result = Array.from(dreamMap.values());
    console.log(`Found ${result.length} dreams within ${radiusMeters}m of (${lat}, ${lng})`);
    return result;
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
