/**
 * Admin role check utility
 * 
 * TODO: This is a temporary solution. Implement proper role-based access
 * control (RBAC) with a role field in the User model in production.
 */

import { prisma } from "@/lib/prisma";

/**
 * List of admin email addresses. Move to environment variable in production.
 */
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",") ?? ["admin@ecomart.local"];

/**
 * Check if a user email is an admin
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email);
}

/**
 * Get admin status from database (when role field is added)
 * For now this is a placeholder.
 */
export async function getUserRole(userId: string): Promise<string | null> {
  // TODO: Query User.role when field is added to schema
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  // Temporary: check email against admin list
  return isAdminEmail(user.email) ? "admin" : "user";
}

/**
 * Check if user is admin (for API routes)
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "admin";
}

/**
 * Check if user is admin by email
 */
export function isAdminByEmail(email: string): boolean {
  return isAdminEmail(email);
}
