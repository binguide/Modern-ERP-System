import { z } from 'zod';

export const emailSchema = z.string().email().toLowerCase().trim();
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const localeSchema = z.enum(['ar', 'en']);

export const idSchema = z.string().uuid();
export const companyIdSchema = idSchema;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});
export type PaginationInput = z.infer<typeof paginationSchema>;

export const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().max(30).optional(),
  branchId: idSchema.optional(),
  roleIds: z.array(idSchema).min(1, 'At least one role is required'),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.partial().omit({ password: true });
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const createCompanySchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(50).regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase alphanumeric'),
  baseCurrency: z.string().length(3).default('SAR'),
  defaultLocale: localeSchema.default('ar'),
});
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

export const createRoleSchema = z.object({
  code: z.string().min(1).max(50).regex(/^[A-Z0-9_]+$/),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  permissions: z
    .array(
      z.object({
        resource: z.string(),
        action: z.enum(['create', 'read', 'update', 'delete', 'approve', 'export', 'manage']),
        scope: z.enum(['own', 'branch', 'company', 'all']).default('company'),
      }),
    )
    .default([]),
});
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
