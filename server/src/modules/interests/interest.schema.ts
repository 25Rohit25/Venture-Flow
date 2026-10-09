import { z } from 'zod';

export const createInterestSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid startup ID format'),
  }),
  body: z.object({
    message: z
      .string()
      .trim()
      .min(20, 'Message must be at least 20 characters explaining your interest')
      .max(500, 'Message cannot exceed 500 characters'),
  }),
});

export const updateInterestStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid interest ID format'),
  }),
  body: z.object({
    status: z.enum(['ACCEPTED', 'DECLINED'], {
      errorMap: () => ({ message: 'Status must be either ACCEPTED or DECLINED' }),
    }),
  }),
});

export const interestIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid interest ID format'),
  }),
});

export type CreateInterestInput = z.infer<typeof createInterestSchema>['body'];
export type UpdateInterestStatusInput = z.infer<typeof updateInterestStatusSchema>['body'];
