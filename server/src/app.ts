import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { startupRouter, meStartupRouter } from './modules/startups/startup.routes.js';
import {
  interestRouter,
  startupInterestRouter,
  meInvestorInterestRouter,
  meFounderReceivedInterestRouter,
} from './modules/interests/interest.routes.js';
import {
  startupBookmarkRouter,
  meBookmarkRouter,
} from './modules/bookmarks/bookmark.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { AppError } from './utils/appError.js';

export const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow API serving
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration with credentials support
const allowedOrigins = [
  config.clientOrigin,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in local dev, allow specified
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  })
);

// Standard body parsers with size limit
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());

// Request ID attachment
app.use((req, res, next) => {
  const reqId = (req.headers['x-request-id'] as string) || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  res.setHeader('X-Request-Id', reqId);
  next();
});

// Health check endpoint (Operational 200; no secrets exposed)
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'operational',
      environment: config.env,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// Mount modular sub-routers under /api/v1
const apiRouter = express.Router();

apiRouter.use('/auth', authRouter);

// Startup discovery and CRUD
apiRouter.use('/startups/:id/interests', startupInterestRouter);
apiRouter.use('/startups/:id/bookmark', startupBookmarkRouter);
apiRouter.use('/startups', startupRouter);

// Interests
apiRouter.use('/interests', interestRouter);

// Bookmarks & user specific resources
apiRouter.use('/me/startups', meStartupRouter);
apiRouter.use('/me/interests', meInvestorInterestRouter);
apiRouter.use('/me/received-interests', meFounderReceivedInterestRouter);
apiRouter.use('/me/bookmarks', meBookmarkRouter);

// Dashboards
apiRouter.use('/dashboard', dashboardRouter);

app.use('/api/v1', apiRouter);

// Catch undefined routes
app.use((req: Request, res: Response, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND'));
});

// Central Error Handler
app.use(errorHandler);
