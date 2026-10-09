import { Request, Response, NextFunction } from 'express';
import { InterestService } from './interest.service.js';

export class InterestController {
  public static async createInterest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const interest = await InterestService.createInterest(
        id,
        req.user!.id,
        req.body.message
      );
      res.status(201).json({
        success: true,
        data: interest,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getMyInterests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const interests = await InterestService.getInvestorInterests(req.user!.id);
      res.status(200).json({
        success: true,
        data: interests,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getMyReceivedInterests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const interests = await InterestService.getFounderReceivedInterests(req.user!.id);
      res.status(200).json({
        success: true,
        data: interests,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async respond(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const updated = await InterestService.respondToInterest(
        id,
        req.user!.id,
        req.body.status
      );
      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async withdraw(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const updated = await InterestService.withdrawInterest(id, req.user!.id);
      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}
