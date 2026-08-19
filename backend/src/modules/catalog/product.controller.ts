import type { Request, Response } from 'express';
import { productService } from './product.service.js';
import type { ListProductsQuery } from './product.schema.js';

export class ProductController {
  async list(req: Request, res: Response) {
  res.json(await productService.list(req.validatedQuery as ListProductsQuery));
  }
  async getById(req: Request, res: Response) {
    res.json(await productService.getById(req.params.id as string));
  }
  async create(req: Request, res: Response) {
    res.status(201).json(await productService.create(req.body));
  }
  async update(req: Request, res: Response) {
    res.json(await productService.update(req.params.id as string, req.body));
  }
  async delete(req: Request, res: Response) {
    await productService.delete(req.params.id as string);
    res.status(204).send();
  }
}

export const productController = new ProductController();