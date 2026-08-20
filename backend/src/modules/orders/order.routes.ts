import { Router } from 'express';
import { orderController as c } from './order.controller.js';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { requireAuth, requireRole } from '../../middlewares/auth.js';
import { createOrderSchema, updateOrderStatusSchema, listOrdersSchema } from './order.schema.js';

const router = Router();

// Todas las rutas de pedidos requieren estar logueado (cliente o admin)
router.use(requireAuth);

router.post('/', validate(createOrderSchema), asyncHandler(c.create.bind(c)));
router.get('/', validate(listOrdersSchema), asyncHandler(c.listMine.bind(c)));
router.get('/:id', asyncHandler(c.getById.bind(c)));

router.patch('/:id/status', requireRole('ADMIN'), validate(updateOrderStatusSchema), asyncHandler(c.updateStatus.bind(c)));

export default router;