import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    sku: z.string().min(3),
    name: z.string().min(2),
    description: z.string().optional(),
    price: z.coerce.number().positive('El precio debe ser mayor a 0'),
    categoryId: z.coerce.number().int().positive(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    price: z.coerce.number().positive().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    isActive: z.boolean().optional(),
  }),
});

// Query params para listar: búsqueda + filtro + paginación
export const listProductsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
export type ListProductsQuery = z.infer<typeof listProductsSchema>['query'];