# Coopidrogas — Backend

API REST para el sistema de e-commerce de Coopidrogas. Proyecto de práctica técnica.

## Stack

- **Runtime**: Node.js 22 + TypeScript 5.9
- **Framework**: Express 5
- **Base de datos**: MySQL 9 + Prisma 7 (driver adapter `@prisma/adapter-mariadb`)
- **Auth**: JWT (access token + refresh token con rotación)
- **Validación**: Zod
- **Testing**: Jest + Supertest

## Arquitectura

Cada módulo de negocio (`auth`, `catalog`, `orders`) sigue la misma estructura en capas:
routes.ts → define endpoints y aplica middlewares
controller.ts → traduce HTTP ↔ service (sin lógica de negocio)
service.ts → lógica de negocio + acceso a datos (sin conocer Express)
schema.ts → validación de entrada con Zod

Middlewares transversales (`src/middlewares/`): manejo de errores centralizado, autenticación JWT, autorización por rol, y validación genérica.

## Setup local

1. Instalar dependencias:
   \`\`\`bash
   npm install
   \`\`\`

2. Copiar variables de entorno:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   Y completar `DATABASE_URL` con tu conexión de MySQL.

3. Aplicar migraciones y generar el cliente de Prisma:
   \`\`\`bash
   npx prisma migrate dev
   \`\`\`

4. (Opcional) Poblar datos base — crea un usuario admin, una categoría y una sede:
   \`\`\`bash
   npm run seed
   \`\`\`

5. Levantar el servidor en modo desarrollo:
   \`\`\`bash
   npm run dev
   \`\`\`

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor en modo desarrollo (hot reload con `tsx`) |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Corre el build de producción |
| `npm test` | Corre la suite de tests (Jest) |
| `npm run seed` | Pobla la BD con datos base |

## Módulos

- **Auth** (`/api/auth`): registro, login, refresh token, logout, sesión actual
- **Catálogo** (`/api/categories`, `/api/products`): CRUD de categorías y productos, búsqueda + paginación
- **Inventario** (`/api/inventory`): gestión de sedes y stock por sede, ajustes atómicos
- **Pedidos** (`/api/orders`): creación transaccional (valida stock, descuenta, calcula total), historial por usuario

## Decisiones técnicas relevantes

- **Access token corto (15min) + refresh token largo (7 días) con rotación**: minimiza la ventana de exposición si un token es robado.
- **Creación de pedidos dentro de `prisma.$transaction`**: garantiza que la verificación de stock, el descuento de inventario y la creación del pedido ocurran como una sola operación atómica.
- **Snapshot de precio en `OrderItem.unitPrice`**: el historial de pedidos no se ve afectado si el precio del producto cambia después.
- **Soft delete en productos**: se desactivan (`isActive: false`) en vez de borrarse, preservando la integridad de pedidos históricos.