import { Request, Response, NextFunction } from 'express';
import { BookmarkService } from './bookmark.service.js';

export class BookmarkController {
  public static async save(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const bookmark = await BookmarkService.saveBookmark(id, req.user!.id);
      res.status(200).json({
        success: true,
        data: bookmark,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await BookmarkService.removeBookmark(id, req.user!.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  public static async getMyBookmarks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 12;
      const result = await BookmarkService.getInvestorBookmarks(req.user!.id, page, limit);
      res.status(200).json({
        success: true,
        data: result.bookmarks,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async check(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const isBookmarked = await BookmarkService.checkBookmarked(id, req.user!.id);
      res.status(200).json({
        success: true,
        data: { isBookmarked },
      });
    } catch (error) {
      next(error);
    }
  }
}
