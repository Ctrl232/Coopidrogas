import { Router } from 'express';
import { categoryController as c } from './category.controller.js';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { requireAuth, requireRole } from '../../middlewares/auth.js';
import { createCategorySchema, updateCategorySchema } from './category.schema.js';

const router = Router();

router.get('/', asyncHandler(c.list.bind(c)));
router.get('/:id', asyncHandler(c.getById.bind(c)));

router.post('/', requireAuth, requireRole('ADMIN'), validate(createCategorySchema), asyncHandler(c.create.bind(c)));
router.patch('/:id', requireAuth, requireRole('ADMIN'), validate(updateCategorySchema), asyncHandler(c.update.bind(c)));
router.delete('/:id', requireAuth, requireRole('ADMIN'), asyncHandler(c.delete.bind(c)));

export default router;