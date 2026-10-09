import { Types } from 'mongoose';
import { StartupModel, IStartup } from './startup.model.js';
import { CreateStartupInput, UpdateStartupInput, DiscoveryQueryInput } from './startup.schema.js';
import { generateSlug } from '../../utils/slug.js';
import { AppError } from '../../utils/appError.js';

export class StartupService {
  public static async createDraft(founderId: string, input: CreateStartupInput): Promise<IStartup> {
    let slug = generateSlug(input.name);
    let attempts = 0;

    while (attempts < 5) {
      const existing = await StartupModel.findOne({ slug });
      if (!existing) break;
      slug = generateSlug(input.name);
      attempts++;
    }

    const startup = await StartupModel.create({
      ...input,
      founderId: new Types.ObjectId(founderId),
      slug,
      status: 'DRAFT',
    });

    return startup;
  }

  public static async getDiscoveryStartups(query: DiscoveryQueryInput): Promise<{
    startups: IStartup[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 12, 24);
    const skip = (page - 1) * limit;

    // Published only security rule
    const filter: Record<string, unknown> = {
      status: 'PUBLISHED',
    };

    if (query.q && query.q.trim()) {
      const sanitized = query.q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: sanitized, $options: 'i' } },
        { tagline: { $regex: sanitized, $options: 'i' } },
      ];
    }

    if (query.industry && query.industry !== 'ALL') {
      filter.industry = query.industry;
    }

    if (query.stage && query.stage !== 'ALL') {
      filter.stage = query.stage;
    }

    if (query.minTarget !== undefined || query.maxTarget !== undefined) {
      filter.targetAmount = {};
      if (query.minTarget !== undefined) {
        (filter.targetAmount as Record<string, number>).$gte = query.minTarget;
      }
      if (query.maxTarget !== undefined) {
        (filter.targetAmount as Record<string, number>).$lte = query.maxTarget;
      }
    }

    let sort: Record<string, 1 | -1> = { publishedAt: -1, _id: -1 };
    if (query.sort === 'target-asc') {
      sort = { targetAmount: 1, _id: -1 };
    } else if (query.sort === 'target-desc') {
      sort = { targetAmount: -1, _id: -1 };
    }

    const [total, startups] = await Promise.all([
      StartupModel.countDocuments(filter),
      StartupModel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('founderId', 'name') // Only safe display name
        .lean(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      startups: startups as unknown as IStartup[],
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  public static async getStartupById(
    id: string,
    viewerUserId?: string
  ): Promise<IStartup> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid startup ID format', 400, 'INVALID_ID');
    }

    const startup = await StartupModel.findById(id).populate('founderId', 'name');

    if (!startup) {
      throw new AppError('Startup not found', 404, 'STARTUP_NOT_FOUND');
    }

    // If not published, only the founder owner can view it
    if (startup.status !== 'PUBLISHED') {
      const isOwner = viewerUserId && startup.founderId._id.toString() === viewerUserId;
      if (!isOwner) {
        throw new AppError('Startup not found', 404, 'STARTUP_NOT_FOUND');
      }
    }

    return startup;
  }

  public static async getFounderStartups(founderId: string): Promise<IStartup[]> {
    return StartupModel.find({ founderId: new Types.ObjectId(founderId) })
      .sort({ createdAt: -1 })
      .lean() as unknown as Promise<IStartup[]>;
  }

  public static async updateStartup(
    id: string,
    founderId: string,
    input: UpdateStartupInput
  ): Promise<IStartup> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid startup ID format', 400, 'INVALID_ID');
    }

    const startup = await StartupModel.findById(id);
    if (!startup) {
      throw new AppError('Startup not found', 404, 'STARTUP_NOT_FOUND');
    }

    if (startup.founderId.toString() !== founderId) {
      throw new AppError('You do not have permission to modify this startup', 403, 'FORBIDDEN');
    }

    Object.assign(startup, input);
    await startup.save();
    return startup;
  }

  public static async updateStartupStatus(
    id: string,
    founderId: string,
    status: 'PUBLISHED' | 'ARCHIVED'
  ): Promise<IStartup> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid startup ID format', 400, 'INVALID_ID');
    }

    const startup = await StartupModel.findById(id);
    if (!startup) {
      throw new AppError('Startup not found', 404, 'STARTUP_NOT_FOUND');
    }

    if (startup.founderId.toString() !== founderId) {
      throw new AppError('You do not have permission to modify this startup', 403, 'FORBIDDEN');
    }

    startup.status = status;
    if (status === 'PUBLISHED' && !startup.publishedAt) {
      startup.publishedAt = new Date();
    }

    await startup.save();
    return startup;
  }
}
