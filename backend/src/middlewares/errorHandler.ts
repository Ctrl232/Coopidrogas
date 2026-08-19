import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

// Middleware de error centralizado. 
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Error de validación',
      details: err.flatten().fieldErrors,
    });
  }

  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error(err.message, { stack: err.stack, path: req.path });
    }
    return res.status(err.statusCode).json({ error: err.message });
  }

  const message = err instanceof Error ? err.message : 'Error desconocido';
  logger.error('Error no controlado', {
    message,
    stack: err instanceof Error ? err.stack : undefined,
    path: req.path,
  });

  return res.status(500).json({ error: 'Error interno del servidor' });
}