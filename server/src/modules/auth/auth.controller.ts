import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, token } = await AuthService.register(req.body);
      AuthService.setAuthCookie(res, token);
      res.status(201).json({
        success: true,
        data: { user, token },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, token } = await AuthService.login(req.body);
      AuthService.setAuthCookie(res, token);
      res.status(200).json({
        success: true,
        data: { user, token },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      AuthService.clearAuthCookie(res);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  public static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        data: { user: req.user },
      });
    } catch (error) {
      next(error);
    }
  }
}
