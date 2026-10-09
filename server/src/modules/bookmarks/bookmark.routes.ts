import { Router } from 'express';
import { BookmarkController } from './bookmark.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { startupIdParamSchema } from '../startups/startup.schema.js';
import { mutationLimiter } from '../../middleware/rateLimiter.js';

// Sub-router for /startups/:id/bookmark
export const startupBookmarkRouter = Router({ mergeParams: true });

startupBookmarkRouter.post(
  '/',
  authenticate,
  requireRole('INVESTOR'),
  mutationLimiter,
  validate(startupIdParamSchema),
  BookmarkController.save
);

startupBookmarkRouter.delete(
  '/',
  authenticate,
  requireRole('INVESTOR'),
  mutationLimiter,
  validate(startupIdParamSchema),
  BookmarkController.remove
);

startupBookmarkRouter.get(
  '/status',
  authenticate,
  requireRole('INVESTOR'),
  validate(startupIdParamSchema),
  BookmarkController.check
);

// Router for /me/bookmarks
export const meBookmarkRouter = Router();

meBookmarkRouter.get(
  '/',
  authenticate,
  requireRole('INVESTOR'),
  BookmarkController.getMyBookmarks
);
