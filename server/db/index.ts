import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';
import { DatabaseSchema } from './schema.js';
import path from 'path';

const sqliteDb = new Database(path.join(process.env.DATA_DIRECTORY || './data', 'database.sqlite'));

export const db = new Kysely<DatabaseSchema>({
  dialect: new SqliteDialect({
    database: sqliteDb,
  }),
  log: ['query', 'error']
});

console.log('Database connected successfully');