import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(100)
    .optional(),

  avatar: z
    .string()
    .url()
    .optional()
    .nullable(),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),

  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /[A-Z]/,
      'Must contain uppercase'
    )
    .regex(
      /[0-9]/,
      'Must contain number'
    ),
});