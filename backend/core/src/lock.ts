import type { PrismaClient } from '@creatoros/db';

/**
 * Global execution lock: a single DB row with a lease and a fencing token.
 * Every operation is one atomic UPDATE, so it is safe across processes,
 * restarts and connection poolers. If a holder crashes, its lease expires
 * and the next acquirer takes over with a higher token.
 */
export const LOCK_ID = 'global';

export async function ensureLockRow(db: PrismaClient) {
  await db.$executeRaw`INSERT INTO "ExecutionLock" (id, token) VALUES (${LOCK_ID}, 0) ON CONFLICT (id) DO NOTHING`;
}

/** Returns the fencing token if acquired, otherwise null. */
export async function acquireLock(db: PrismaClient, holder: string, workerId: string, leaseSec: number): Promise<bigint | null> {
  const rows = await db.$queryRaw<{ token: bigint }[]>`
    UPDATE "ExecutionLock"
       SET holder = ${holder}, "workerId" = ${workerId}, token = token + 1,
           "leaseUntil" = now() + make_interval(secs => ${leaseSec}), "acquiredAt" = now()
     WHERE id = ${LOCK_ID} AND (holder IS NULL OR "leaseUntil" < now())
     RETURNING token`;
  return rows[0]?.token ?? null;
}

/** Extends the lease. Returns false if the lock was lost (expired and taken, or force-released). */
export async function renewLock(db: PrismaClient, holder: string, token: bigint, leaseSec: number): Promise<boolean> {
  const n = await db.$executeRaw`
    UPDATE "ExecutionLock" SET "leaseUntil" = now() + make_interval(secs => ${leaseSec})
     WHERE id = ${LOCK_ID} AND holder = ${holder} AND token = ${token}`;
  return n === 1;
}

export async function releaseLock(db: PrismaClient, holder: string, token: bigint): Promise<boolean> {
  const n = await db.$executeRaw`
    UPDATE "ExecutionLock" SET holder = NULL, "workerId" = NULL, "leaseUntil" = NULL
     WHERE id = ${LOCK_ID} AND holder = ${holder} AND token = ${token}`;
  return n === 1;
}

export async function getLock(db: PrismaClient) {
  return db.executionLock.findUnique({ where: { id: LOCK_ID } });
}
