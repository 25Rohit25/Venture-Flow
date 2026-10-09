import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(80, 'Name cannot exceed 80 characters'),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Invalid email address format'),
    password: z
      .string()
      .min(10, 'Password must be at least 10 characters long')
      .max(100, 'Password cannot exceed 100 characters'),
    role: z.enum(['FOUNDER', 'INVESTOR'], {
      errorMap: () => ({ message: 'Role must be either FOUNDER or INVESTOR' }),
    }),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Invalid email address format'),
    password: z
      .string()
      .min(1, 'Password is required')
      .max(100, 'Password is too long'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
