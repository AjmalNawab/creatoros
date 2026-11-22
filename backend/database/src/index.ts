import { PrismaClient } from '@prisma/client';
export * from '@prisma/client';

/**
 * Supabase's Session pooler allows only 15 clients in total. Prisma opens (CPU count × 2 + 1) connections
 * per process by default, so the API and the worker together could exhaust the pool. Cap each process
 * (override with DB_CONNECTION_LIMIT) unless the URL already sets connection_limit.
 */
function withConnectionLimit(url: string | undefined): string | undefined {
  if (!url || /[?&]connection_limit=/.test(url)) return url;
  const limit = process.env.DB_CONNECTION_LIMIT ?? '3';
  return `${url}${url.includes('?') ? '&' : '?'}connection_limit=${limit}`;
}

let client: PrismaClient | undefined;
export const getDb = () => (client ??= new PrismaClient({
  datasourceUrl: withConnectionLimit(process.env.DATABASE_URL),
  // The pooler is a network hop away and each process has few connections: give multi-step transactions room.
  transactionOptions: { maxWait: 15_000, timeout: 30_000 },
}));
