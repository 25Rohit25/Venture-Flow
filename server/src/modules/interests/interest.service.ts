import { Types } from 'mongoose';
import { InterestModel, IInterest } from './interest.model.js';
import { StartupModel } from '../startups/startup.model.js';
import { AppError } from '../../utils/appError.js';

export class InterestService {
  public static async createInterest(
    startupId: string,
    investorId: string,
    message: string
  ): Promise<IInterest> {
    if (!Types.ObjectId.isValid(startupId)) {
      throw new AppError('Invalid startup ID format', 400, 'INVALID_ID');
    }

    // Startup must exist and be PUBLISHED
    const startup = await StartupModel.findOne({
      _id: new Types.ObjectId(startupId),
      status: 'PUBLISHED',
    });

    if (!startup) {
      throw new AppError(
        'Startup not found or not currently accepting investor interest.',
        404,
        'STARTUP_NOT_PUBLISHED'
      );
    }

    try {
      const interest = await InterestModel.create({
        startupId: new Types.ObjectId(startupId),
        investorId: new Types.ObjectId(investorId),
        message,
        status: 'PENDING',
      });

      return interest;
    } catch (error: any) {
      // Catch duplicate key error for { startupId, investorId }
      if (error && error.code === 11000) {
        throw new AppError(
          'You have already expressed interest in this startup.',
          409,
          'INTEREST_ALREADY_EXISTS'
        );
      }
      throw error;
    }
  }

  public static async getInvestorInterests(investorId: string): Promise<IInterest[]> {
    return InterestModel.find({ investorId: new Types.ObjectId(investorId) })
      .populate('startupId', 'name slug tagline industry stage targetAmount status location')
      .sort({ createdAt: -1 })
      .lean() as unknown as Promise<IInterest[]>;
  }

  public static async getFounderReceivedInterests(founderId: string): Promise<IInterest[]> {
    const founderStartups = await StartupModel.find({
      founderId: new Types.ObjectId(founderId),
    }).select('_id');

    const startupIds = founderStartups.map((s) => s._id);

    return InterestModel.find({ startupId: { $in: startupIds } })
      .populate('startupId', 'name slug tagline industry stage targetAmount status')
      .populate('investorId', 'name') // display name only
      .sort({ createdAt: -1 })
      .lean() as unknown as Promise<IInterest[]>;
  }

  public static async respondToInterest(
    interestId: string,
    founderId: string,
    status: 'ACCEPTED' | 'DECLINED'
  ): Promise<IInterest> {
    if (!Types.ObjectId.isValid(interestId)) {
      throw new AppError('Invalid interest ID format', 400, 'INVALID_ID');
    }

    const interest = await InterestModel.findById(interestId);
    if (!interest) {
      throw new AppError('Interest request not found', 404, 'INTEREST_NOT_FOUND');
    }

    // Verify ownership of the target startup
    const startup = await StartupModel.findById(interest.startupId);
    if (!startup || startup.founderId.toString() !== founderId) {
      throw new AppError('You do not have permission to respond to this interest request.', 403, 'FORBIDDEN');
    }

    // Atomic conditional update ensuring status is currently PENDING
    const updated = await InterestModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(interestId),
        status: 'PENDING',
      },
      {
        $set: {
          status,
          respondedAt: new Date(),
        },
      },
      { new: true }
    )
      .populate('startupId', 'name slug tagline')
      .populate('investorId', 'name');

    if (!updated) {
      throw new AppError(
        'Interest request has already been processed or withdrawn.',
        409,
        'INVALID_STATE_TRANSITION'
      );
    }

    return updated;
  }

  public static async withdrawInterest(
    interestId: string,
    investorId: string
  ): Promise<IInterest> {
    if (!Types.ObjectId.isValid(interestId)) {
      throw new AppError('Invalid interest ID format', 400, 'INVALID_ID');
    }

    const interest = await InterestModel.findById(interestId);
    if (!interest) {
      throw new AppError('Interest request not found', 404, 'INTEREST_NOT_FOUND');
    }

    if (interest.investorId.toString() !== investorId) {
      throw new AppError('You do not have permission to withdraw this interest request.', 403, 'FORBIDDEN');
    }

    // Atomic conditional update
    const updated = await InterestModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(interestId),
        status: 'PENDING',
      },
      {
        $set: {
          status: 'WITHDRAWN',
          respondedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updated) {
      throw new AppError(
        'Interest request cannot be withdrawn as it is no longer pending.',
        409,
        'INVALID_STATE_TRANSITION'
      );
    }

    return updated;
  }
}
