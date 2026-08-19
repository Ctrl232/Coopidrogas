import { Router } from 'express';
import { productController as c } from './product.controller.js';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { requireAuth, requireRole } from '../../middlewares/auth.js';
import { createProductSchema, updateProductSchema, listProductsSchema } from './product.schema.js';

const router = Router();

router.get('/', validate(listProductsSchema), asyncHandler(c.list.bind(c)));
router.get('/:id', asyncHandler(c.getById.bind(c)));

router.post('/', requireAuth, requireRole('ADMIN'), validate(createProductSchema), asyncHandler(c.create.bind(c)));
router.patch('/:id', requireAuth, requireRole('ADMIN'), validate(updateProductSchema), asyncHandler(c.update.bind(c)));
router.delete('/:id', requireAuth, requireRole('ADMIN'), asyncHandler(c.delete.bind(c)));

export default router;