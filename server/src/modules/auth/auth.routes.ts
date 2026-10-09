import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { registerSchema, loginSchema } from './auth.schema.js';
import { authenticate } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimiter.js';

export const authRouter = Router();

authRouter.post('/register', authLimiter, validate(registerSchema), AuthController.register);
authRouter.post('/login', authLimiter, validate(loginSchema), AuthController.login);
authRouter.post('/logout', authenticate, AuthController.logout);
authRouter.get('/me', authenticate, AuthController.me);
