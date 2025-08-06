import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import { DatabaseSchema } from './schema.js';

const { Pool } = pg;

// --- CORREÇÃO FINAL E ROBUSTA ---
// Primeiro, tentamos obter a variável de ambiente padrão que a Vercel fornece ('POSTGRES_URL').
// Se ela não for encontrada, tentamos a versão com o prefixo do projeto.
const connectionString = process.env.POSTGRES_URL || process.env.mandalaraiz_POSTGRES_URL;

// Adicionamos uma verificação robusta para garantir que uma das variáveis foi encontrada.
if (!connectionString) {
  console.error("ERRO CRÍTICO: Nenhuma variável de ambiente de conexão com o Postgres (POSTGRES_URL ou mandalaraiz_POSTGRES_URL) foi encontrada!");
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

console.log('Database dialect configured for Vercel Postgres with robust variable checking.');
