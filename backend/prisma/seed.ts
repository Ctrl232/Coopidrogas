import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  // --- Roles y usuario admin (ya existente, se mantiene igual) ---
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

  // --- Sedes ---
  const branches = await Promise.all([
    prisma.branch.upsert({
      where: { id: 1 },
      update: {},
      create: { name: 'Sede Zipaquirá Centro', address: 'Cra 10 # 5-20' },
    }),
    prisma.branch.upsert({
      where: { id: 2 },
      update: {},
      create: { name: 'Sede Bogotá Chapinero', address: 'Cl 63 # 12-30' },
    }),
    prisma.branch.upsert({
      where: { id: 3 },
      update: {},
      create: { name: 'Sede Cajicá', address: 'Cra 4 # 8-15' },
    }),
  ]);

  // --- Categorías ---
  const categoriesData = [
    { name: 'Analgésicos', slug: 'analgesicos' },
    { name: 'Vitaminas y Suplementos', slug: 'vitaminas-suplementos' },
    { name: 'Cuidado Personal', slug: 'cuidado-personal' },
    { name: 'Cuidado del Bebé', slug: 'cuidado-bebe' },
    { name: 'Dermatología', slug: 'dermatologia' },
    { name: 'Equipos Médicos', slug: 'equipos-medicos' },
  ];

  const categories: Record<string, { id: number }> = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // --- Productos (17 productos repartidos entre las categorías) ---
  const productsData = [
    { sku: 'ACET-500', name: 'Acetaminofén 500mg', description: 'Caja x20 tabletas', price: 8500, category: 'analgesicos' },
    { sku: 'IBUP-400', name: 'Ibuprofeno 400mg', description: 'Caja x30 tabletas', price: 12900, category: 'analgesicos' },
    { sku: 'ASPIR-100', name: 'Aspirina 100mg', description: 'Caja x28 tabletas', price: 9800, category: 'analgesicos' },
    { sku: 'NAPROX-550', name: 'Naproxeno 550mg', description: 'Caja x10 tabletas', price: 14500, category: 'analgesicos' },

    { sku: 'VITC-1000', name: 'Vitamina C 1000mg', description: 'Frasco x30 tabletas efervescentes', price: 22900, category: 'vitaminas-suplementos' },
    { sku: 'VITD3-2000', name: 'Vitamina D3 2000UI', description: 'Frasco x60 cápsulas', price: 28500, category: 'vitaminas-suplementos' },
    { sku: 'OMEGA3-1000', name: 'Omega 3 1000mg', description: 'Frasco x90 cápsulas', price: 45900, category: 'vitaminas-suplementos' },
    { sku: 'MULTIVIT-A', name: 'Multivitamínico Adulto', description: 'Frasco x60 tabletas', price: 32000, category: 'vitaminas-suplementos' },

    { sku: 'GEL-ANTIB', name: 'Gel Antibacterial 500ml', description: 'Con 70% de alcohol', price: 15900, category: 'cuidado-personal' },
    { sku: 'PROTSOL-50', name: 'Protector Solar FPS 50', description: 'Tubo 120ml', price: 38900, category: 'cuidado-personal' },
    { sku: 'ENJUAG-BUC', name: 'Enjuague Bucal 500ml', description: 'Sabor menta', price: 13500, category: 'cuidado-personal' },

    { sku: 'PAÑAL-T3', name: 'Pañales Talla 3', description: 'Paquete x40 unidades', price: 42900, category: 'cuidado-bebe' },
    { sku: 'TOALL-HUM', name: 'Toallitas Húmedas', description: 'Paquete x80 unidades', price: 11900, category: 'cuidado-bebe' },
    { sku: 'CREMA-PAÑAL', name: 'Crema Antipañalitis', description: 'Tubo 100g', price: 18500, category: 'cuidado-bebe' },

    { sku: 'CREMA-HIDR', name: 'Crema Hidratante Corporal', description: 'Frasco 400ml', price: 24900, category: 'dermatologia' },
    { sku: 'JABON-DERM', name: 'Jabón Dermatológico', description: 'Barra 90g, piel sensible', price: 9500, category: 'dermatologia' },

    { sku: 'TENS-DIGIT', name: 'Tensiómetro Digital', description: 'Medición de brazo, memoria 90 registros', price: 89900, category: 'equipos-medicos' },
    { sku: 'TERM-DIGIT', name: 'Termómetro Digital', description: 'Lectura en 10 segundos', price: 15900, category: 'equipos-medicos' },
    { sku: 'GLUC-DIGIT', name: 'Glucómetro Digital', description: 'Incluye 10 tiras reactivas', price: 65900, category: 'equipos-medicos' },
  ];

  const products = [];
  for (const p of productsData) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        sku: p.sku,
        name: p.name,
        description: p.description,
        price: p.price,
        categoryId: categories[p.category].id,
      },
    });
    products.push(product);
  }

  // --- Inventario: cada producto con stock aleatorio en cada sede ---
  for (const product of products) {
    for (const branch of branches) {
      const quantity = Math.floor(Math.random() * 80) + 10; // entre 10 y 90 unidades

      await prisma.inventoryItem.upsert({
        where: { productId_branchId: { productId: product.id, branchId: branch.id } },
        update: { quantity },
        create: { productId: product.id, branchId: branch.id, quantity },
      });
    }
  }

  console.log(`✅ Seed completado:`);
  console.log(`   - ${branches.length} sedes`);
  console.log(`   - ${Object.keys(categories).length} categorías`);
  console.log(`   - ${products.length} productos`);
  console.log(`   - Admin: admin@coopidrogas.com / AdminPass123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());