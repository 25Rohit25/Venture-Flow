import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service.js';

export class DashboardController {
  public static async getFounderDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await DashboardService.getFounderDashboard(req.user!.id);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getInvestorDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await DashboardService.getInvestorDashboard(req.user!.id);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
