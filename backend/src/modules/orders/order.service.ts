import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { ConflictError, ForbiddenError, NotFoundError } from '../../utils/AppError.js';
import type { CreateOrderInput, ListOrdersQuery } from './order.schema.js';

export class OrderService {

  async create(userId: string, input: CreateOrderInput) {
    return prisma.$transaction(async (tx) => {
      let total = new Prisma.Decimal(0);
      const orderItemsData: { productId: string; quantity: number; unitPrice: Prisma.Decimal }[] = [];

      for (const item of input.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || !product.isActive) {
          throw new NotFoundError(`Producto ${item.productId} no encontrado o inactivo`);
        }

        const inventoryItem = await tx.inventoryItem.findUnique({
          where: { productId_branchId: { productId: item.productId, branchId: input.branchId } },
        });

        if (!inventoryItem || inventoryItem.quantity < item.quantity) {
          throw new ConflictError(`Stock insuficiente para "${product.name}" en esta sede`);
        }

        await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: { quantity: { decrement: item.quantity } },
        });

        total = total.add(product.price.mul(item.quantity));
        orderItemsData.push({ productId: item.productId, quantity: item.quantity, unitPrice: product.price });
      }

      return tx.order.create({
        data: {
          userId,
          branchId: input.branchId,
          total,
          items: { create: orderItemsData },
        },
        include: { items: { include: { product: true } }, branch: true },
      });
    });
  }

  async listByUser(userId: string, query: ListOrdersQuery) {
    const { page, pageSize } = query;

    const [total, items] = await Promise.all([
      prisma.order.count({ where: { userId } }),
      prisma.order.findMany({
        where: { userId },
        include: { items: { include: { product: { select: { name: true, sku: true } } } }, branch: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { items, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async getById(orderId: string, userId: string, userRole: 'CLIENTE' | 'ADMIN') {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } }, branch: true, user: { select: { email: true, fullName: true } } },
    });

    if (!order) throw new NotFoundError('Pedido no encontrado');

    if (userRole !== 'ADMIN' && order.userId !== userId) {
      throw new ForbiddenError('No tienes acceso a este pedido');
    }

    return order;
  }

  async updateStatus(orderId: string, status: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundError('Pedido no encontrado');

    return prisma.order.update({
      where: { id: orderId },
      data: { status: status as never },
    });
  }
}

export const orderService = new OrderService();