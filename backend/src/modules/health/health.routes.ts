import { Router } from 'express';
import { prisma } from '../../config/prisma.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

const router = Router();

// Confirma que el proceso este vivo y la base de datos conectadaa 
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const startedAt = Date.now();
    let dbStatus: 'up' | 'down' = 'up';

    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'down';
    }

    const status = dbStatus === 'up' ? 200 : 503;
    res.status(status).json({
      status: dbStatus === 'up' ? 'ok' : 'degraded',
      db: dbStatus,
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  }),
);

export default router;