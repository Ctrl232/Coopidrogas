import type { Request, Response } from 'express';
import { inventoryService } from './inventory.service.js';

export class InventoryController {
  async listBranches(_req: Request, res: Response) {
    res.json(await inventoryService.listBranches());
  }
  async createBranch(req: Request, res: Response) {
    res.status(201).json(await inventoryService.createBranch(req.body));
  }
  async getAvailability(req: Request, res: Response) {
    res.json(await inventoryService.getAvailabilityByProduct(req.params.productId as string));
  }
  async adjustStock(req: Request, res: Response) {
    res.json(await inventoryService.adjustStock(req.body));
  }
}

export const inventoryController = new InventoryController();