import type { Request, Response } from 'express';
import { categoryService } from './category.service.js';

export class CategoryController {
  async list(_req: Request, res: Response) {
    res.json(await categoryService.list());
  }
  async getById(req: Request, res: Response) {
    res.json(await categoryService.getById(Number(req.params.id)));
  }
  async create(req: Request, res: Response) {
    res.status(201).json(await categoryService.create(req.body));
  }
  async update(req: Request, res: Response) {
    res.json(await categoryService.update(Number(req.params.id), req.body));
  }
  async delete(req: Request, res: Response) {
    await categoryService.delete(Number(req.params.id));
    res.status(204).send();
  }
}

export const categoryController = new CategoryController();