import { Router } from 'express';
import { DashboardController } from './dashboard.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';

export const dashboardRouter = Router();

dashboardRouter.get(
  '/founder',
  authenticate,
  requireRole('FOUNDER'),
  DashboardController.getFounderDashboard
);

dashboardRouter.get(
  '/investor',
  authenticate,
  requireRole('INVESTOR'),
  DashboardController.getInvestorDashboard
);
