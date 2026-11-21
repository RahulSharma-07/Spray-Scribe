const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'rahulsharma9925054976@gmail.com';
  const password = 'rahul18182112';
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: { 
        password: hashedPassword,
        role: 'ADMIN',
        plan: 'ENTERPRISE',
        credits: 10000,
      },
      create: {
        email,
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
        plan: 'ENTERPRISE',
        credits: 10000,
      },
    });
    console.log('Admin user created/updated:', user.email, '| Role:', user.role);
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();