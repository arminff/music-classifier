import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Validate DATABASE_URL is set and has correct format
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    '❌ DATABASE_URL environment variable is not set!\n\n' +
    'Please configure it in Vercel:\n' +
    '1. Go to https://vercel.com/dashboard\n' +
    '2. Select your project → Settings → Environment Variables\n' +
    '3. Add DATABASE_URL with your PostgreSQL connection string\n' +
    '4. Format: postgresql://user:password@host:5432/database?schema=public\n' +
    '5. Redeploy your application\n\n' +
    'Get a free database from: Supabase, Neon, or Railway'
  );
}

if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
  throw new Error(
    '❌ Invalid DATABASE_URL format!\n\n' +
    `Current value: ${databaseUrl.substring(0, 20)}...\n\n` +
    'The URL must start with "postgresql://" or "postgres://"\n' +
    'Make sure you:\n' +
    '1. Removed any quotes around the URL\n' +
    '2. Used the full connection string from your database provider\n' +
    '3. Format: postgresql://user:password@host:5432/database?schema=public'
  );
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

