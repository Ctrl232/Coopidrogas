import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from './auth.controller.js';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { requireAuth } from '../../middlewares/auth.js';
import { registerSchema, loginSchema, refreshSchema } from './auth.schema.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { error: 'Demasiados intentos de inicio de sesión. Intenta de nuevo más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', validate(registerSchema), asyncHandler(authController.register.bind(authController)));
router.post('/login', loginLimiter, validate(loginSchema), asyncHandler(authController.login.bind(authController)));
router.post('/refresh', validate(refreshSchema), asyncHandler(authController.refresh.bind(authController)));
router.post('/logout', validate(refreshSchema), asyncHandler(authController.logout.bind(authController)));
router.get('/me', requireAuth, asyncHandler(authController.me.bind(authController)));

export default router;