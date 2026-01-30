import { z } from 'zod';

// Email validation schema
export const emailSchema = z
  .string()
  .min(3, 'Email must be at least 3 characters')
  .max(255, 'Email must not exceed 255 characters')
  .email('Invalid email format');

// Password validation schema
export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password must not exceed 100 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Name validation schema
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must not exceed 100 characters')
  .trim();

// Register schema with password confirmation
export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// TypeScript types
export type RegisterFormData = z.infer<typeof registerSchema>;
export type EmailFormData = z.infer<typeof emailSchema>;
export type PasswordFormData = z.infer<typeof passwordSchema>;
export type NameFormData = z.infer<typeof nameSchema>;
