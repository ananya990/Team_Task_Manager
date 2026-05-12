import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200),

  description: z
    .string()
    .max(2000)
    .optional(),

  status: z
    .enum([
      'active',
      'completed',
      'archived',
    ])
    .optional()
    .default('active'),

  members: z
    .array(z.string())
    .optional()
    .default([]),
});

export const updateProjectSchema =
  createProjectSchema.partial();

export const addMemberSchema = z.object({
  userId: z
    .string()
    .min(1, 'User ID is required'),
});