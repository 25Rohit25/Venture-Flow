import { Types } from 'mongoose';
import { StartupModel } from '../startups/startup.model.js';
import { InterestModel } from '../interests/interest.model.js';
import { BookmarkModel } from '../bookmarks/bookmark.model.js';

export class DashboardService {
  public static async getFounderDashboard(founderId: string): Promise<{
    stats: {
      totalStartups: number;
      publishedStartups: number;
      draftStartups: number;
      archivedStartups: number;
      pendingInterests: number;
      acceptedInterests: number;
      declinedInterests: number;
      totalInterestsReceived: number;
    };
    recentInterests: Array<any>;
    activityLast7Days: Array<{ date: string; count: number }>;
  }> {
    const founderObjectId = new Types.ObjectId(founderId);

    // 1. Get founder's startups
    const startups = await StartupModel.find({ founderId: founderObjectId });
    const startupIds = startups.map((s) => s._id);

    const publishedCount = startups.filter((s) => s.status === 'PUBLISHED').length;
    const draftCount = startups.filter((s) => s.status === 'DRAFT').length;
    const archivedCount = startups.filter((s) => s.status === 'ARCHIVED').length;

    // 2. Aggregate interest counts constrained strictly to founder's startups
    let pendingInterests = 0;
    let acceptedInterests = 0;
    let declinedInterests = 0;
    let totalInterestsReceived = 0;

    if (startupIds.length > 0) {
      const statusCounts = await InterestModel.aggregate([
        { $match: { startupId: { $in: startupIds } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);

      for (const item of statusCounts) {
        totalInterestsReceived += item.count;
        if (item._id === 'PENDING') pendingInterests = item.count;
        if (item._id === 'ACCEPTED') acceptedInterests = item.count;
        if (item._id === 'DECLINED') declinedInterests = item.count;
      }
    }

    // 3. Recent received interests (safe: only investor display name)
    const recentInterests = startupIds.length > 0
      ? await InterestModel.find({ startupId: { $in: startupIds } })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('startupId', 'name slug stage')
          .populate('investorId', 'name')
          .lean()
      : [];

    // 4. 7-day activity grouping
    const activityLast7Days: Array<{ date: string; count: number }> = [];
    const now = new Date();

    // Map each day for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      activityLast7Days.push({ date: dateStr, count: 0 });
    }

    if (startupIds.length > 0) {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const dailyCounts = await InterestModel.aggregate([
        {
          $match: {
            startupId: { $in: startupIds },
            createdAt: { $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
      ]);

      const countMap = new Map(dailyCounts.map((item) => [item._id, item.count]));
      for (const day of activityLast7Days) {
        if (countMap.has(day.date)) {
          day.count = countMap.get(day.date)!;
        }
      }
    }

    return {
      stats: {
        totalStartups: startups.length,
        publishedStartups: publishedCount,
        draftStartups: draftCount,
        archivedStartups: archivedCount,
        pendingInterests,
        acceptedInterests,
        declinedInterests,
        totalInterestsReceived,
      },
      recentInterests,
      activityLast7Days,
    };
  }

  public static async getInvestorDashboard(investorId: string): Promise<{
    stats: {
      totalSubmitted: number;
      pending: number;
      accepted: number;
      declined: number;
      withdrawn: number;
      savedBookmarks: number;
    };
    recentInterests: Array<any>;
    savedStartups: Array<any>;
    activityLast7Days: Array<{ date: string; count: number }>;
  }> {
    const investorObjectId = new Types.ObjectId(investorId);

    // 1. Status counts for investor's submitted interests
    const statusCounts = await InterestModel.aggregate([
      { $match: { investorId: investorObjectId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    let pending = 0;
    let accepted = 0;
    let declined = 0;
    let withdrawn = 0;
    let totalSubmitted = 0;

    for (const item of statusCounts) {
      totalSubmitted += item.count;
      if (item._id === 'PENDING') pending = item.count;
      if (item._id === 'ACCEPTED') accepted = item.count;
      if (item._id === 'DECLINED') declined = item.count;
      if (item._id === 'WITHDRAWN') withdrawn = item.count;
    }

    // 2. Bookmarks count and recent bookmarks
    const [savedBookmarks, bookmarks] = await Promise.all([
      BookmarkModel.countDocuments({ investorId: investorObjectId }),
      BookmarkModel.find({ investorId: investorObjectId })
        .sort({ createdAt: -1 })
        .limit(4)
        .populate({
          path: 'startupId',
          select: 'name slug tagline industry stage targetAmount status location',
        })
        .lean(),
    ]);

    // 3. Recent submitted interests
    const recentInterests = await InterestModel.find({ investorId: investorObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('startupId', 'name slug industry stage targetAmount')
      .lean();

    // 4. 7-day activity grouping
    const activityLast7Days: Array<{ date: string; count: number }> = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      activityLast7Days.push({ date: dateStr, count: 0 });
    }

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyCounts = await InterestModel.aggregate([
      {
        $match: {
          investorId: investorObjectId,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map(dailyCounts.map((item) => [item._id, item.count]));
    for (const day of activityLast7Days) {
      if (countMap.has(day.date)) {
        day.count = countMap.get(day.date)!;
      }
    }

    return {
      stats: {
        totalSubmitted,
        pending,
        accepted,
        declined,
        withdrawn,
        savedBookmarks,
      },
      recentInterests,
      savedStartups: bookmarks,
      activityLast7Days,
    };
  }
}
