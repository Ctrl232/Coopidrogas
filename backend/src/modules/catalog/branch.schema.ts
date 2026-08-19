import { z } from 'zod';

export const createBranchSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    address: z.string().min(5),
  }),
});

export const adjustStockSchema = z.object({
  body: z.object({
    productId: z.string().uuid(),
    branchId: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int(), 
  }),
});

export type CreateBranchInput = z.infer<typeof createBranchSchema>['body'];
export type AdjustStockInput = z.infer<typeof adjustStockSchema>['body'];