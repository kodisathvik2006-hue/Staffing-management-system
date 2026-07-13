import { UserRole } from "@prisma/client";

export type Permission =
  | "self_entity:read"
  | "self_entity:write"
  | "self_entity:sensitive"
  | "vendor:read"
  | "vendor:write"
  | "consultant:read"
  | "consultant:write"
  | "salesperson:read"
  | "salesperson:write"
  | "client:read"
  | "client:write"
  | "project:read"
  | "project:write"
  | "project:status"
  | "commission:read"
  | "commission:write"
  | "document:read"
  | "document:write"
  | "template:read"
  | "template:write"
  | "user:manage"
  | "audit:read";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    "self_entity:read",
    "self_entity:write",
    "self_entity:sensitive",
    "vendor:read",
    "vendor:write",
    "consultant:read",
    "consultant:write",
    "salesperson:read",
    "salesperson:write",
    "client:read",
    "client:write",
    "project:read",
    "project:write",
    "project:status",
    "commission:read",
    "commission:write",
    "document:read",
    "document:write",
    "template:read",
    "template:write",
    "user:manage",
    "audit:read",
  ],
  ADMIN: [
    "self_entity:read",
    "self_entity:write",
    "self_entity:sensitive",
    "vendor:read",
    "vendor:write",
    "consultant:read",
    "consultant:write",
    "salesperson:read",
    "salesperson:write",
    "client:read",
    "client:write",
    "project:read",
    "project:write",
    "project:status",
    "commission:read",
    "commission:write",
    "document:read",
    "document:write",
    "template:read",
    "template:write",
    "user:manage",
    "audit:read",
  ],
  PROJECT_MANAGER: [
    "self_entity:read",
    "vendor:read",
    "vendor:write",
    "consultant:read",
    "consultant:write",
    "salesperson:read",
    "salesperson:write",
    "client:read",
    "client:write",
    "project:read",
    "project:write",
    "project:status",
    "commission:read",
    "commission:write",
    "document:read",
    "document:write",
    "template:read",
    "template:write",
  ],
  SALESPERSON: [
    "consultant:read",
    "salesperson:read",
    "client:read",
    "project:read",
    "commission:read",
    "document:read",
  ],
  VENDOR: [
    "vendor:read",
    "vendor:write",
    "project:read",
    "document:read",
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(
  roles: UserRole[],
  permission: Permission
): boolean {
  return roles.some((role) => hasPermission(role, permission));
}

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  PROJECT_MANAGER: "Project Manager",
  SALESPERSON: "Salesperson",
  VENDOR: "Vendor",
};
