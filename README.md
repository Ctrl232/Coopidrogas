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

# Coopidrogas — Frontend

Interfaz web del sistema de e-commerce de Coopidrogas. Proyecto consume la API del [backend](../backend).

## Stack

- **Build tool**: Vite 8
- **Framework**: React 19 + TypeScript
- **Estilos**: Tailwind CSS
- **Ruteo**: React Router
- **Estado del servidor**: TanStack Query (React Query)
- **Estado del cliente**: Zustand (con persistencia en localStorage)
- **HTTP**: Axios (con interceptores de auth)

## Arquitectura
src/
├── api/ # Funciones que llaman a cada endpoint del backend (una por dominio)
├── components/ # Componentes reutilizables (Navbar, Footer, CartButton...)
├── pages/ # Una página por ruta
├── routes/ # Rutas protegidas (ProtectedRoute)
├── store/ # Estado global con Zustand (sesión, carrito)
├── types/ # Interfaces TypeScript — espejo del contrato de la API
└── lib/ # Configuración de librerías (React Query client)


**Separación de responsabilidades**: los componentes de `pages/` nunca llaman a `axios` directo — siempre pasan por `api/`. Esto aísla el "cómo hablamos con el backend" de "cómo se ve la pantalla": si un endpoint cambia, solo se toca `api/`, ningún componente se entera.

## Autenticación

El flujo de sesión está diseñado para ser transparente al usuario:

- El **access token** (JWT, expira en 15 min) se inyecta automáticamente en cada request saliente mediante un interceptor de Axios (`src/api/client.ts`).
- Si el backend responde `401` (token expirado), el mismo interceptor intenta refrescar la sesión con el **refresh token** y reintenta la petición original una sola vez — el usuario nunca ve un error de sesión expirada en uso normal.
- La sesión (`user`, `accessToken`, `refreshToken`) se guarda en `localStorage` vía `zustand/persist`, así que sobrevive a recargas de página.

**Nota de seguridad**: la protección de rutas en el frontend (`ProtectedRoute`) es solo de experiencia de usuario — evita que alguien vea visualmente una pantalla que no le corresponde. La seguridad real vive en el backend (`requireRole('ADMIN')`), porque el JavaScript del navegador siempre se puede inspeccionar o modificar.

## Setup local

1. Instalar dependencias:
```bash
   npm install
```

2. Copiar variables de entorno:
```bash
   cp .env.example .env
```
   Por defecto apunta a `http://localhost:4000/api` — ajusta `VITE_API_URL` si tu backend corre en otro puerto.

3. Asegúrate de que el [backend](../backend) esté corriendo (`npm run dev` desde esa carpeta).

4. Levantar el servidor de desarrollo:
```bash
   npm run dev
```

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Build de producción a `dist/` |
| `npm run preview` | Sirve el build de producción localmente |

## Páginas

- **`/`** — Home pública con el diseño institucional
- **`/registro`, `/login`** — Autenticación
- **`/catalogo`** — Listado de productos con búsqueda, filtro por categoría y paginación
- **`/carrito`** — Carrito persistente, selección de sede, checkout
- **`/pedidos/:id`** — Detalle de un pedido (protegida, requiere sesión)
- **`/admin`** — Panel de administración (protegida, requiere rol `ADMIN`)

## Decisiones técnicas relevantes

- **React Query en vez de `useEffect` + `useState` manual**: cachea respuestas del backend, maneja estados de carga/error de forma consistente, y revalida automáticamente sin código adicional.
- **Zustand en vez de Context API**: cada componente se suscribe solo al pedazo de estado que necesita, evitando re-renders innecesarios en un estado tan usado como la sesión.
- **`req.validatedQuery` en el backend + tipos espejo en `types/`**: los filtros de búsqueda del catálogo (`search`, `categoryId`, `page`) están tipados de punta a punta, del input del usuario hasta la query de Prisma.
- **Componentes compartidos (`Navbar`, `Footer`, `CartButton`) fuera de `pages/`**: se agregan una sola vez en `App.tsx` y aparecen consistentes en todas las rutas.