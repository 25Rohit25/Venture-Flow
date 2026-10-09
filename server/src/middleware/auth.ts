import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../modules/auth/auth.service.js';
import { UserModel, SafeUser, toSafeUser, UserRole } from '../modules/auth/user.model.js';
import { AppError } from '../utils/appError.js';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let token = req.cookies?.[AuthService.COOKIE_NAME];

    // Also support Authorization header for flexible API usage & integration tests
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }

    if (!token) {
      throw new AppError('Authentication required. Please log in.', 401, 'UNAUTHORIZED');
    }

    const payload = AuthService.verifyToken(token);
    const user = await UserModel.findById(payload.userId);

    if (!user) {
      throw new AppError('User account not found.', 401, 'USER_NOT_FOUND');
    }

    req.user = toSafeUser(user);
    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let token = req.cookies?.[AuthService.COOKIE_NAME];
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }

    if (token) {
      try {
        const payload = AuthService.verifyToken(token);
        const user = await UserModel.findById(payload.userId);
        if (user) {
          req.user = toSafeUser(user);
        }
      } catch {
        // Silently continue as guest
      }
    }
    next();
  } catch {
    next();
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required.', 401, 'UNAUTHORIZED');
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(
        `Access denied. Requires one of the following roles: ${roles.join(', ')}`,
        403,
        'FORBIDDEN_ROLE'
      );
    }

    next();
  };
}
