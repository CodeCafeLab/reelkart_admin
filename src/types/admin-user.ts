
import { z } from 'zod';

// Define roles using an array for easier iteration and as an ENUM for Zod
export const ADMIN_ROLES = ['SuperAdmin', 'KYCReviewer', 'ContentModerator', 'LogisticsManager', 'ReportsManager', 'SellerManager', 'SupportExecutive'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const adminRoleEnum = z.enum(ADMIN_ROLES);

// Define sample permissions
export const PERMISSIONS = [
  'manage_admin_users', 'view_admin_users',
  'manage_roles_permissions', 'view_roles_permissions',
  'manage_platform_settings',
  'view_dashboard_analytics',
  'manage_kyc_submissions',
  'moderate_content',
  'manage_order_logistics',
  'manage_seller_packages',
  'view_ai_usage_logs',
  'generate_reports',
  'handle_support_tickets',
  'manage_seller_onboarding'
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export interface AdminUser {
  id: string;
  email: string;
  full_name?: string | null;
  role: AdminRole;
  last_login_at?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Schema for creating a new admin user (POST /api/admin-users)
export const createAdminUserSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  full_name: z.string().optional(),
  role: adminRoleEnum,
  is_active: z.boolean().optional().default(true),
});
export type CreateAdminUserPayload = z.infer<typeof createAdminUserSchema>;

// Schema for updating an admin user (PUT /api/admin-users/[id])
// Note: Password updates should ideally be handled via a separate, more secure endpoint.
export const updateAdminUserSchema = z.object({
  full_name: z.string().optional(),
  role: adminRoleEnum.optional(),
  is_active: z.boolean().optional(),
});
export type UpdateAdminUserPayload = z.infer<typeof updateAdminUserSchema>;

