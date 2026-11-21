
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'test@example.com';
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: { password: hashedPassword },
      create: {
        email,
        password: hashedPassword,
        name: 'Test User',
        role: 'USER',
        credits: 1000,
        plan: 'Enterprise',
      },
    });
    console.log('User created/updated:', user.email);
  } catch (error) {
    console.error('Error seeding user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
