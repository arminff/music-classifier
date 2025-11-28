/**
 * Reset user password script
 * Useful if you forgot a password or need to reset it
 * 
 * Run with: npx tsx scripts/reset-user-password.ts <email> <new-password>
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error('Usage: npx tsx scripts/reset-user-password.ts <email> <new-password>');
    console.error('Example: npx tsx scripts/reset-user-password.ts user@example.com newpassword123');
    process.exit(1);
  }

  if (newPassword.length < 6) {
    console.error('Password must be at least 6 characters long');
    process.exit(1);
  }

  console.log(`Resetting password for: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`User with email ${email} not found`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email },
    data: {
      passwordHash,
      failedLogins: 0,
      lockedUntil: null,
    },
  });

  console.log(`✅ Password reset successfully for ${email}`);
  console.log(`New password: ${newPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

