import { prisma } from '../../config/prisma.js';
import { ConflictError, NotFoundError } from '../../utils/AppError.js';
import type { CreateProductInput, UpdateProductInput, ListProductsQuery } from './product.schema.js';

export class ProductService {
  // Búsqueda + filtro + paginación real 
  async list(query: ListProductsQuery) {
    const { search, categoryId, page, pageSize } = query;

    const where = {
      isActive: true,
      ...(categoryId && { categoryId }),
      ...(search && { name: { contains: search } }), 
    };

    // Count + findMany en paralelo (Promise.all reducir latencia casi a la mitad) en vez de secuencial
    const [total, items] = await Promise.all([ 
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: { category: { select: { id: true, name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, inventory: { include: { branch: true } } },
    });
    if (!product) throw new NotFoundError('Producto no encontrado');
    return product;
  }

  async create(input: CreateProductInput) {
    const existing = await prisma.product.findUnique({ where: { sku: input.sku } });
    if (existing) throw new ConflictError('Ya existe un producto con ese SKU');

    return prisma.product.create({ data: input, include: { category: true } });
  }

  async update(id: string, input: UpdateProductInput) {
    await this.getById(id);
    return prisma.product.update({ where: { id }, data: input, include: { category: true } });
  }

  async delete(id: string) {
    await this.getById(id);
    await prisma.product.update({ where: { id }, data: { isActive: false } });
  }
}

export const productService = new ProductService();