import { Types } from 'mongoose';
import { BookmarkModel, IBookmark } from './bookmark.model.js';
import { StartupModel } from '../startups/startup.model.js';
import { AppError } from '../../utils/appError.js';

export class BookmarkService {
  public static async saveBookmark(startupId: string, investorId: string): Promise<IBookmark> {
    if (!Types.ObjectId.isValid(startupId)) {
      throw new AppError('Invalid startup ID format', 400, 'INVALID_ID');
    }

    const startup = await StartupModel.findById(startupId);
    if (!startup || startup.status !== 'PUBLISHED') {
      throw new AppError('Startup not found or not currently available.', 404, 'STARTUP_NOT_FOUND');
    }

    try {
      const bookmark = await BookmarkModel.findOneAndUpdate(
        {
          startupId: new Types.ObjectId(startupId),
          investorId: new Types.ObjectId(investorId),
        },
        {
          $setOnInsert: {
            startupId: new Types.ObjectId(startupId),
            investorId: new Types.ObjectId(investorId),
          },
        },
        { upsert: true, new: true }
      );
      return bookmark!;
    } catch (error: any) {
      if (error && error.code === 11000) {
        const existing = await BookmarkModel.findOne({
          startupId: new Types.ObjectId(startupId),
          investorId: new Types.ObjectId(investorId),
        });
        return existing!;
      }
      throw error;
    }
  }

  public static async removeBookmark(startupId: string, investorId: string): Promise<void> {
    if (!Types.ObjectId.isValid(startupId)) {
      throw new AppError('Invalid startup ID format', 400, 'INVALID_ID');
    }

    await BookmarkModel.deleteOne({
      startupId: new Types.ObjectId(startupId),
      investorId: new Types.ObjectId(investorId),
    });
  }

  public static async getInvestorBookmarks(
    investorId: string,
    page = 1,
    limit = 12
  ): Promise<{
    bookmarks: Array<any>;
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const skip = (page - 1) * limit;

    const [total, bookmarks] = await Promise.all([
      BookmarkModel.countDocuments({ investorId: new Types.ObjectId(investorId) }),
      BookmarkModel.find({ investorId: new Types.ObjectId(investorId) })
        .populate({
          path: 'startupId',
          select: 'name slug tagline industry stage targetAmount status location founderId publishedAt',
          populate: { path: 'founderId', select: 'name' },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      bookmarks,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  public static async checkBookmarked(startupId: string, investorId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(startupId) || !Types.ObjectId.isValid(investorId)) {
      return false;
    }
    const bookmark = await BookmarkModel.findOne({
      startupId: new Types.ObjectId(startupId),
      investorId: new Types.ObjectId(investorId),
    });
    return !!bookmark;
  }
}
