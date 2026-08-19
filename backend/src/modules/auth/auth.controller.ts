import type { Request, Response } from 'express';
import { authService } from './auth.service.js';

// Los controllers son deliberadamente delgados: parsean el request,
// llaman al service, y traducen el resultado a una respuesta HTTP.
export class AuthController {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  }

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  }

  async refresh(req: Request, res: Response) {
    const result = await authService.refresh(req.body.refreshToken);
    res.status(200).json(result);
  }

  async logout(req: Request, res: Response) {
    await authService.logout(req.body.refreshToken);
    res.status(204).send();
  }

  async me(req: Request, res: Response) {
    res.status(200).json({ user: req.user });
  }
}

export const authController = new AuthController();