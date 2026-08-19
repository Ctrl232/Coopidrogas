import { prisma } from '../../config/prisma.js';
import { ConflictError, NotFoundError } from '../../utils/AppError.js';
import type { CreateCategoryInput, UpdateCategoryInput } from './category.schema.js';

export class CategoryService {
  async list() {
    return prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async getById(id: number) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundError('Categoría no encontrada');
    return category;
  }
  
  async create(input: CreateCategoryInput) {
    const existing = await prisma.category.findFirst({
      where: { OR: [{ name: input.name }, { slug: input.slug }] },
    });
    if (existing) throw new ConflictError('Ya existe una categoría con ese nombre o slug');

    return prisma.category.create({ data: input });
  }

  async update(id: number, input: UpdateCategoryInput) {
    await this.getById(id); // valida que exista, o lanza 404
    return prisma.category.update({ where: { id }, data: input });
  }

  async delete(id: number) {
    await this.getById(id);
    await prisma.category.delete({ where: { id } });
  }
}

export const categoryService = new CategoryService();