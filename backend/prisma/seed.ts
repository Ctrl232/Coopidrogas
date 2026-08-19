import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  });

  const passwordHash = await bcrypt.hash('AdminPass123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@coopidrogas.com' },
    update: {},
    create: {
      email: 'admin@coopidrogas.com',
      passwordHash,
      fullName: 'Admin Coopidrogas',
      roleId: adminRole.id,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'analgesicos' },
    update: {},
    create: { name: 'Analgésicos', slug: 'analgesicos' },
  });

  await prisma.branch.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'Sede Zipaquirá Centro', address: 'Cra 10 # 5-20' },
  });

  console.log('✅ Seed completado — admin: admin@coopidrogas.com / AdminPass123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());