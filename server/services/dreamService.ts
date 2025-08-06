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

  // --- FUNÇÃO CORRIGIDA (VERSÃO FINAL E MAIS ROBUSTA) ---
  async findNearbyDreams(lat: number, lng: number, radiusMeters: number = 2000): Promise<any[]> {
    try {
      // Expressão SQL pura para o cálculo da distância (fórmula de Haversine)
      const distanceCalculation = sql<number>`
          ( 6371000 * acos( cos( radians(${lat}) ) * cos( radians(location_lat) ) * cos( radians(location_lng) - radians(${lng}) ) + sin( radians(${lat}) ) * sin( radians(location_lat) ) ) )
      `;

      // PASSO 1: Encontrar apenas os IDs dos sonhos que estão dentro do raio de distância.
      // Esta query é muito simples e rápida.
      const nearbyDreamIds = await db
        .selectFrom('dreams')
        .select(['id', distanceCalculation.as('distance')])
        .where('is_active', '=', true)
        .where('location_lat', 'is not', null)
        .where('location_lng', 'is not', null)
        .having(distanceCalculation, '<=', radiusMeters)
        .orderBy('distance')
        .limit(50) // Limita a 50 resultados para segurança
        .execute();

      if (nearbyDreamIds.length === 0) {
        console.log(`Found 0 dreams within ${radiusMeters}m of (${lat}, ${lng})`);
        return [];
      }

      const dreamIds = nearbyDreamIds.map(d => d.id);
      const distancesMap = new Map(nearbyDreamIds.map(d => [d.id, d.distance]));

      // PASSO 2: Buscar os detalhes completos e as tags apenas para os sonhos encontrados.
      const dreamsWithTags = await db
        .selectFrom('dreams')
        .leftJoin('dream_tags', 'dreams.id', 'dream_tags.dream_id')
        .selectAll('dreams')
        .select('dream_tags.tag')
        .where('dreams.id', 'in', dreamIds)
        .execute();

      // PASSO 3: Agrupar os resultados em JavaScript (agora com um conjunto de dados muito menor).
      const dreamMap = new Map();
      dreamsWithTags.forEach(dream => {
        if (!dreamMap.has(dream.id)) {
          const { tag, ...dreamData } = dream;
          dreamMap.set(dream.id, {
            ...dreamData,
            distance: distancesMap.get(dream.id), // Adiciona a distância que calculámos antes
            tags: []
          });
        }
        if (dream.tag) {
          dreamMap.get(dream.id).tags.push(dream.tag);
        }
      });
      
      const result = Array.from(dreamMap.values()).sort((a, b) => a.distance - b.distance);
      console.log(`Found ${result.length} dreams and returning them.`);
      return result;

    } catch (error) {
        console.error('[findNearbyDreams ERROR]:', error);
        // Devolve um erro 500 explícito para podermos ver a causa nos logs
        throw new Error('Failed to fetch nearby dreams due to a database error.');
    }
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
