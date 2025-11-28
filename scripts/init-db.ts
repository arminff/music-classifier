/**
 * Database initialization script
 * Creates an admin user for testing
 * 
 * Run with: npx tsx scripts/init-db.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Initializing database...');

  // Create admin user
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      role: 'Administrator',
    },
  });

  console.log('Admin user created:', admin.email);
  console.log('Password:', adminPassword);

  // Create regular user
  const userEmail = 'user@example.com';
  const userPassword = 'user123';
  const userPasswordHash = await bcrypt.hash(userPassword, 10);

  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      email: userEmail,
      passwordHash: userPasswordHash,
      role: 'User',
    },
  });

  console.log('User created:', user.email);
  console.log('Password:', userPassword);

  console.log('\nDatabase initialization complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

