import { Request, Response, NextFunction } from 'express';
import { StartupService } from './startup.service.js';

export class StartupController {
  public static async getDiscovery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await StartupService.getDiscoveryStartups(req.query as any);
      res.status(200).json({
        success: true,
        data: result.startups,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const startup = await StartupService.getStartupById(id, req.user?.id);
      res.status(200).json({
        success: true,
        data: startup,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const startup = await StartupService.createDraft(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        data: startup,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getMyStartups(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const startups = await StartupService.getFounderStartups(req.user!.id);
      res.status(200).json({
        success: true,
        data: startups,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getMyStartupById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const startup = await StartupService.getStartupById(id, req.user!.id);
      res.status(200).json({
        success: true,
        data: startup,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const startup = await StartupService.updateStartup(id, req.user!.id, req.body);
      res.status(200).json({
        success: true,
        data: startup,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const startup = await StartupService.updateStartupStatus(id, req.user!.id, req.body.status);
      res.status(200).json({
        success: true,
        data: startup,
      });
    } catch (error) {
      next(error);
    }
  }
}
