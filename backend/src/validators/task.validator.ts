import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(300),

  description: z
    .string()
    .max(5000)
    .optional(),

  status: z
    .enum([
      'todo',
      'in_progress',
      'review',
      'completed',
    ])
    .optional()
    .default('todo'),

  priority: z
    .enum([
      'low',
      'medium',
      'high',
      'urgent',
    ])
    .optional()
    .default('medium'),

  dueDate: z
    .string()
    .datetime()
    .optional()
    .nullable(),

  assignedTo: z
    .string()
    .optional()
    .nullable(),

  project: z
    .string()
    .min(1, 'Project ID is required'),

  tags: z
    .array(z.string())
    .optional()
    .default([]),
});

export const updateTaskSchema = createTaskSchema
  .omit({
    project: true,
  })
  .partial()
  .extend({
    project: z.string().optional(),
  });