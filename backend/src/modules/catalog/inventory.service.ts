import { prisma } from '../../config/prisma.js';
import { NotFoundError, ConflictError } from '../../utils/AppError.js';
import type { CreateBranchInput, AdjustStockInput } from './branch.schema.js';

export class InventoryService {
  async listBranches() {
    return prisma.branch.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  }

  async createBranch(input: CreateBranchInput) {
    return prisma.branch.create({ data: input });
  }

  async getAvailabilityByProduct(productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundError('Producto no encontrado');

    return prisma.inventoryItem.findMany({
      where: { productId },
      include: { branch: { select: { id: true, name: true, address: true } } },
      orderBy: { branch: { name: 'asc' } },
    });
  }

  async adjustStock(input: AdjustStockInput) {
    const item = await prisma.inventoryItem.upsert({
      where: { productId_branchId: { productId: input.productId, branchId: input.branchId } },
      update: {}, 
      create: { productId: input.productId, branchId: input.branchId, quantity: 0 },
    });

    const newQuantity = item.quantity + input.quantity;
    if (newQuantity < 0) {
      throw new ConflictError('Stock insuficiente para esta operación');
    }

    return prisma.inventoryItem.update({
      where: { id: item.id },
      data: { quantity: { increment: input.quantity } },
      include: { product: { select: { name: true, sku: true } }, branch: { select: { name: true } } },
    });
  }
}

export const inventoryService = new InventoryService();