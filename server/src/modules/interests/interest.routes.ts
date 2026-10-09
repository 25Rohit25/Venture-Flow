import { Router } from 'express';
import { InterestController } from './interest.controller.js';
import { validate } from '../../middleware/validate.js';
import {
  createInterestSchema,
  updateInterestStatusSchema,
  interestIdParamSchema,
} from './interest.schema.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { mutationLimiter } from '../../middleware/rateLimiter.js';

// Base /interests routes
export const interestRouter = Router();

// Founder updates status (ACCEPTED / DECLINED)
interestRouter.patch(
  '/:id/status',
  authenticate,
  requireRole('FOUNDER'),
  mutationLimiter,
  validate(updateInterestStatusSchema),
  InterestController.respond
);

// Investor withdraws pending interest
interestRouter.post(
  '/:id/withdraw',
  authenticate,
  requireRole('INVESTOR'),
  mutationLimiter,
  validate(interestIdParamSchema),
  InterestController.withdraw
);

// Sub-route for /startups/:id/interests
export const startupInterestRouter = Router({ mergeParams: true });
startupInterestRouter.post(
  '/',
  authenticate,
  requireRole('INVESTOR'),
  mutationLimiter,
  validate(createInterestSchema),
  InterestController.createInterest
);

// Investor's own submissions: /me/interests
export const meInvestorInterestRouter = Router();
meInvestorInterestRouter.get(
  '/',
  authenticate,
  requireRole('INVESTOR'),
  InterestController.getMyInterests
);

// Founder's received submissions: /me/received-interests
export const meFounderReceivedInterestRouter = Router();
meFounderReceivedInterestRouter.get(
  '/',
  authenticate,
  requireRole('FOUNDER'),
  InterestController.getMyReceivedInterests
);
