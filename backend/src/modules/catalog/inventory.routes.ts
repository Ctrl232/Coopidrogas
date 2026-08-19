import { Router } from 'express';
import { inventoryController as c } from './inventory.controller.js';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { requireAuth, requireRole } from '../../middlewares/auth.js';
import { createBranchSchema, adjustStockSchema } from './branch.schema.js';

const router = Router();

router.get('/branches', asyncHandler(c.listBranches.bind(c)));
router.post('/branches', requireAuth, requireRole('ADMIN'), validate(createBranchSchema), asyncHandler(c.createBranch.bind(c)));

router.get('/products/:productId/availability', asyncHandler(c.getAvailability.bind(c)));
router.post('/adjust', requireAuth, requireRole('ADMIN'), validate(adjustStockSchema), asyncHandler(c.adjustStock.bind(c)));

export default router;