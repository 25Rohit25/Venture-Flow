import { Router } from 'express';
import { StartupController } from './startup.controller.js';
import { validate } from '../../middleware/validate.js';
import {
  createStartupSchema,
  updateStartupSchema,
  updateStartupStatusSchema,
  discoveryQuerySchema,
  startupIdParamSchema,
} from './startup.schema.js';
import { authenticate, optionalAuth, requireRole } from '../../middleware/auth.js';
import { mutationLimiter } from '../../middleware/rateLimiter.js';

export const startupRouter = Router();

// Public discovery
startupRouter.get('/', validate(discoveryQuerySchema), StartupController.getDiscovery);

// Public / owner detail (optional auth to inspect if owner viewing draft)
startupRouter.get('/:id', optionalAuth, validate(startupIdParamSchema), StartupController.getById);

// Founder draft creation
startupRouter.post(
  '/',
  authenticate,
  requireRole('FOUNDER'),
  mutationLimiter,
  validate(createStartupSchema),
  StartupController.create
);

// Founder edit startup
startupRouter.patch(
  '/:id',
  authenticate,
  requireRole('FOUNDER'),
  mutationLimiter,
  validate(updateStartupSchema),
  StartupController.update
);

// Founder status update (publish / archive)
startupRouter.patch(
  '/:id/status',
  authenticate,
  requireRole('FOUNDER'),
  mutationLimiter,
  validate(updateStartupStatusSchema),
  StartupController.updateStatus
);

// Founder's own startups routes
export const meStartupRouter = Router();
meStartupRouter.get('/', authenticate, requireRole('FOUNDER'), StartupController.getMyStartups);
meStartupRouter.get('/:id', authenticate, requireRole('FOUNDER'), validate(startupIdParamSchema), StartupController.getMyStartupById);
