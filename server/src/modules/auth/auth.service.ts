import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { UserModel, IUser, toSafeUser, SafeUser } from './user.model.js';
import { RegisterInput, LoginInput } from './auth.schema.js';
import { AppError } from '../../utils/appError.js';
import { config } from '../../config/env.js';

export interface TokenPayload {
  userId: string;
  role: 'FOUNDER' | 'INVESTOR';
  email: string;
}

export class AuthService {
  private static readonly SALT_ROUNDS = 10;
  public static readonly COOKIE_NAME = 'ventureflow_session';

  public static async register(input: RegisterInput): Promise<{ user: SafeUser; token: string }> {
    const existing = await UserModel.findOne({ email: input.email });
    if (existing) {
      throw new AppError('An account with this email address already exists.', 409, 'EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await bcrypt.hash(input.password, this.SALT_ROUNDS);

    const user = await UserModel.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    });

    const token = this.generateToken(user);
    return { user: toSafeUser(user), token };
  }

  public static async login(input: LoginInput): Promise<{ user: SafeUser; token: string }> {
    const user = await UserModel.findOne({ email: input.email }).select('+passwordHash');
    if (!user) {
      throw new AppError('Invalid email or password combination.', 401, 'INVALID_CREDENTIALS');
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid email or password combination.', 401, 'INVALID_CREDENTIALS');
    }

    const token = this.generateToken(user);
    return { user: toSafeUser(user), token };
  }

  public static generateToken(user: IUser): string {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: '2h',
    });
  }

  public static verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwtSecret) as TokenPayload;
    } catch {
      throw new AppError('Authentication session is invalid or has expired.', 401, 'INVALID_TOKEN');
    }
  }

  public static setAuthCookie(res: Response, token: string): void {
    res.cookie(this.COOKIE_NAME, token, {
      httpOnly: true,
      secure: config.cookieSecure,
      sameSite: config.cookieSecure ? 'none' : 'lax',
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
      path: '/',
    });
  }

  public static clearAuthCookie(res: Response): void {
    res.clearCookie(this.COOKIE_NAME, {
      httpOnly: true,
      secure: config.cookieSecure,
      sameSite: config.cookieSecure ? 'none' : 'lax',
      path: '/',
    });
  }
}
