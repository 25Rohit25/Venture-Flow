import { z } from 'zod';

const industries = ['FINTECH', 'HEALTHTECH', 'EDTECH', 'SAAS', 'ECOMMERCE', 'OTHER'] as const;
const stages = ['IDEA', 'MVP', 'EARLY_REVENUE', 'GROWTH'] as const;
const statuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;

export const createStartupSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Startup name must be at least 2 characters')
      .max(100, 'Startup name cannot exceed 100 characters'),
    tagline: z
      .string()
      .trim()
      .min(5, 'Tagline must be at least 5 characters')
      .max(160, 'Tagline cannot exceed 160 characters'),
    description: z
      .string()
      .trim()
      .min(100, 'Description must be at least 100 characters to provide meaningful overview')
      .max(4000, 'Description cannot exceed 4000 characters'),
    industry: z.enum(industries, {
      errorMap: () => ({ message: 'Invalid industry sector' }),
    }),
    stage: z.enum(stages, {
      errorMap: () => ({ message: 'Invalid startup stage' }),
    }),
    targetAmount: z
      .number({ invalid_type_error: 'Target funding amount must be a number' })
      .int('Target funding amount must be an integer')
      .min(10000, 'Target funding must be at least ₹10,000')
      .max(1000000000, 'Target funding exceeds maximum allowable demo amount'),
    location: z
      .string()
      .trim()
      .max(100, 'Location cannot exceed 100 characters')
      .optional(),
  }),
});

export const updateStartupSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid startup ID format'),
  }),
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    tagline: z.string().trim().min(5).max(160).optional(),
    description: z.string().trim().min(100).max(4000).optional(),
    industry: z.enum(industries).optional(),
    stage: z.enum(stages).optional(),
    targetAmount: z.number().int().min(10000).max(1000000000).optional(),
    location: z.string().trim().max(100).optional(),
  }),
});

export const updateStartupStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid startup ID format'),
  }),
  body: z.object({
    status: z.enum(['PUBLISHED', 'ARCHIVED'], {
      errorMap: () => ({ message: 'Status must be either PUBLISHED or ARCHIVED' }),
    }),
  }),
});

export const discoveryQuerySchema = z.object({
  query: z.object({
    q: z.string().trim().optional(),
    industry: z.enum([...industries, 'ALL']).optional(),
    stage: z.enum([...stages, 'ALL']).optional(),
    minTarget: z.coerce.number().min(0).optional(),
    maxTarget: z.coerce.number().min(0).optional(),
    sort: z.enum(['newest', 'target-asc', 'target-desc']).optional().default('newest'),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(24).optional().default(12),
  }),
});

export const startupIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid startup ID format'),
  }),
});

export type CreateStartupInput = z.infer<typeof createStartupSchema>['body'];
export type UpdateStartupInput = z.infer<typeof updateStartupSchema>['body'];
export type UpdateStartupStatusInput = z.infer<typeof updateStartupStatusSchema>['body'];
export type DiscoveryQueryInput = z.infer<typeof discoveryQuerySchema>['query'];
