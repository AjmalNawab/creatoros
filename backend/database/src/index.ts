import { PrismaClient } from '@prisma/client';
export * from '@prisma/client';

let client: PrismaClient | undefined;
export const getDb = () => (client ??= new PrismaClient());
