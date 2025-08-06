import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import { DatabaseSchema } from './schema.js';

const { Pool } = pg;

// --- CORREÇÃO IMPORTANTE ---
// A Vercel adiciona um prefixo ao nome do projeto nas variáveis de ambiente.
// O nosso código precisa de usar o nome exato da variável que a Vercel fornece.
// Com base na sua imagem, o nome correto é `mandalaraiz_POSTGRES_URL`.
const connectionString = process.env.mandalaraiz_POSTGRES_URL;

// Adicionamos uma verificação para garantir que a variável foi encontrada.
if (!connectionString) {
  console.error("ERRO CRÍTICO: A variável de ambiente mandalaraiz_POSTGRES_URL não foi encontrada!");
  // Lança um erro para que o problema seja visível nos logs da Vercel.
  throw new Error("A variável de ambiente da base de dados não está configurada.");
}

export const db = new Kysely<DatabaseSchema>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: connectionString,
    }),
  }),
  log: ['query', 'error']
});

console.log('Database dialect configured to use the correct Vercel environment variable.');
