import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import { DatabaseSchema } from './schema.js';

// Desestrutura o Pool do pg para facilitar o uso
const { Pool } = pg;

// Cria a instância do Kysely com o dialeto correto para Postgres
export const db = new Kysely<DatabaseSchema>({
  dialect: new PostgresDialect({
    // Usa a variável de ambiente POSTGRES_URL que a Vercel irá fornecer
    pool: new Pool({
      connectionString: process.env.POSTGRES_URL,
    }),
  }),
  log: ['query', 'error']
});

console.log('Database dialect configured for Vercel Postgres');
