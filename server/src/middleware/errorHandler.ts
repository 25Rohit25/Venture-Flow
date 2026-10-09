import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const requestId = (req.headers['x-request-id'] as string) || 'req-' + Date.now();

  // Operational AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  // Zod validation error
  if (err instanceof ZodError) {
    const message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: message || 'Invalid input data',
        details: err.flatten(),
      },
    });
    return;
  }

  // MongoDB CastError (invalid ObjectId)
  if (err && typeof err === 'object' && 'name' in err && err.name === 'CastError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: 'Invalid resource identifier format',
      },
    });
    return;
  }

  // MongoDB Duplicate Key (E11000)
  if (err && typeof err === 'object' && 'code' in err && (err as { code: number }).code === 11000) {
    res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'A resource with these unique properties already exists',
      },
    });
    return;
  }

  // SyntaxError from body-parser
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      success: false,
      error: {
        code: 'BAD_JSON',
        message: 'Malformed JSON payload',
      },
    });
    return;
  }

  // Unexpected internal server error - never expose stack trace or internal messages
  logger.error('Unexpected server error', {
    requestId,
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred. Please try again later.',
    },
  });
}
