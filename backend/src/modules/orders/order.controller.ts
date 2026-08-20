import type { Request, Response } from 'express';
import { orderService } from './order.service.js';
import type { ListOrdersQuery } from './order.schema.js';

export class OrderController {
  async create(req: Request, res: Response) {
    const userId = req.user!.sub;
    res.status(201).json(await orderService.create(userId, req.body));
  }

  async listMine(req: Request, res: Response) {
    const userId = req.user!.sub;
    res.json(await orderService.listByUser(userId, req.validatedQuery as ListOrdersQuery));
  }

  async getById(req: Request, res: Response) {
    const { sub: userId, role } = req.user!;
    res.json(await orderService.getById(req.params.id as string, userId, role));
  }

  async updateStatus(req: Request, res: Response) {
    res.json(await orderService.updateStatus(req.params.id as string, req.body.status));
  }
}

export const orderController = new OrderController();