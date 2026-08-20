import { jest } from '@jest/globals';

// El mock de $transaction ejecuta el callback que le pasa OrderService,
// inyectándole el mismo prismaMock como "tx"
const prismaMock = {
  product: {
    findUnique: jest.fn<() => Promise<unknown>>(),
  },
  inventoryItem: {
    findUnique: jest.fn<() => Promise<unknown>>(),
    update: jest.fn<() => Promise<unknown>>(),
  },
  order: {
    create: jest.fn<() => Promise<unknown>>(),
    count: jest.fn<() => Promise<unknown>>(),
    findMany: jest.fn<() => Promise<unknown>>(),
    findUnique: jest.fn<() => Promise<unknown>>(),
  },
  $transaction: jest.fn(async (callback: (tx: unknown) => Promise<unknown>) => callback(prismaMock)),
};

jest.unstable_mockModule('../../src/config/prisma.js', () => ({ prisma: prismaMock }));

const { OrderService } = await import('../../src/modules/orders/order.service.js');
const { ConflictError, NotFoundError, ForbiddenError } = await import('../../src/utils/AppError.js');

describe('OrderService', () => {
  let orderService: InstanceType<typeof OrderService>;

  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) =>
      callback(prismaMock),
    );
    orderService = new OrderService();
  });

  describe('create', () => {
    const validInput = {
      branchId: 1,
      items: [{ productId: 'prod-1', quantity: 5 }],
    };

    it('lanza NotFoundError si el producto no existe', async () => {
      prismaMock.product.findUnique.mockResolvedValueOnce(null);

      await expect(orderService.create('user-1', validInput)).rejects.toThrow(NotFoundError);
    });

    it('lanza ConflictError si no hay stock suficiente', async () => {
    const { Prisma } = await import('@prisma/client');

    prismaMock.product.findUnique.mockResolvedValueOnce({
        id: 'prod-1',
        isActive: true,
        price: new Prisma.Decimal(8500),
    });
    prismaMock.inventoryItem.findUnique.mockResolvedValueOnce({ id: 'inv-1', quantity: 2 }); // pidió 5, hay 2

    await expect(orderService.create('user-1', validInput)).rejects.toThrow(ConflictError);
    expect(prismaMock.inventoryItem.update).not.toHaveBeenCalled();
    });

    it('crea el pedido y descuenta el stock cuando todo es válido', async () => {
    const { Prisma } = await import('@prisma/client');

    prismaMock.product.findUnique.mockResolvedValueOnce({
        id: 'prod-1',
        isActive: true,
        price: new Prisma.Decimal(8500),
    });
    prismaMock.inventoryItem.findUnique.mockResolvedValueOnce({ id: 'inv-1', quantity: 50 });
    prismaMock.inventoryItem.update.mockResolvedValueOnce({});
    prismaMock.order.create.mockResolvedValueOnce({ id: 'order-1', status: 'PENDIENTE' });

    const result = await orderService.create('user-1', validInput);

    expect(prismaMock.inventoryItem.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.order.create).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ id: 'order-1', status: 'PENDIENTE' });
    });
  });

  describe('getById', () => {
    it('lanza NotFoundError si el pedido no existe', async () => {
      prismaMock.order.findUnique.mockResolvedValueOnce(null);

      await expect(orderService.getById('order-x', 'user-1', 'CLIENTE')).rejects.toThrow(NotFoundError);
    });

    it('lanza ForbiddenError si un CLIENTE intenta ver el pedido de otro usuario', async () => {
      prismaMock.order.findUnique.mockResolvedValueOnce({ id: 'order-1', userId: 'otro-usuario' });

      await expect(orderService.getById('order-1', 'user-1', 'CLIENTE')).rejects.toThrow(ForbiddenError);
    });

    it('permite a un ADMIN ver el pedido de cualquier usuario', async () => {
      prismaMock.order.findUnique.mockResolvedValueOnce({ id: 'order-1', userId: 'otro-usuario' });

      const result = await orderService.getById('order-1', 'admin-1', 'ADMIN');
      expect(result).toEqual({ id: 'order-1', userId: 'otro-usuario' });
    });
  });
});