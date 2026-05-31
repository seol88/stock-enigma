import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

export function getDb(env: any) {
  // En Qwik City, las variables de entorno se obtienen del RequestEvent
  const url = env.get('TURSO_DATABASE_URL');
  const authToken = env.get('TURSO_AUTH_TOKEN');

  if (!url || !authToken) {
    throw new Error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
  }

  const client = createClient({
    url,
    authToken,
  });

  return drizzle(client, { schema });
}
