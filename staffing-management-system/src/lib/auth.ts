import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  getSession,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  type TokenPayload,
} from "@/lib/jwt";
import { hasAnyPermission, type Permission } from "@/lib/permissions";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function buildTokenPayload(userId: string): Promise<TokenPayload> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { entityRoles: true },
  });

  return {
    sub: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: user.entityRoles.map((r) => ({
      selfEntityId: r.selfEntityId,
      role: r.role,
    })),
    vendorId: user.vendorId || undefined,
  };
}

export async function createAuthTokens(userId: string) {
  const payload = await buildTokenPayload(userId);
  const accessToken = await signAccessToken(payload);
  const refreshToken = await signRefreshToken(userId);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken, payload };
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export async function requireAuth(): Promise<TokenPayload> {
  const session = await getSession();
  if (!session) {
    throw new ApiError(401, "Unauthorized");
  }
  return session;
}

export async function requirePermission(
  permission: Permission,
  selfEntityId?: string
): Promise<TokenPayload> {
  const session = await requireAuth();

  const relevantRoles = selfEntityId
    ? session.roles
        .filter((r) => r.selfEntityId === selfEntityId)
        .map((r) => r.role)
    : session.roles.map((r) => r.role);

  if (!hasAnyPermission(relevantRoles as any, permission)) {
    throw new ApiError(403, "Forbidden");
  }

  return session;
}

export function getTenantId(
  session: TokenPayload,
  requestedTenantId?: string | null
): string {
  if (requestedTenantId) {
    const hasAccess = session.roles.some(
      (r) => r.selfEntityId === requestedTenantId
    );
    if (!hasAccess) {
      throw new ApiError(403, "No access to this organization");
    }
    return requestedTenantId;
  }

  if (session.roles.length === 0) {
    throw new ApiError(403, "No organization assigned");
  }

  return session.roles[0].selfEntityId;
}

export function jsonResponse<T>(data: T, status = 200) {
  return Response.json(data, { status });
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return jsonResponse({ error: error.message }, error.status);
  }
  console.error(error);
  return jsonResponse({ error: "Internal server error" }, 500);
}

export function getClientIp(request: NextRequest): string | undefined {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    undefined
  );
}

export async function logAudit(params: {
  selfEntityId?: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}) {
  await prisma.auditLog.create({
    data: {
      selfEntityId: params.selfEntityId,
      userId: params.userId,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      metadata: params.metadata as any,
      ipAddress: params.ipAddress,
    },
  });
}

export function getHighestRole(roles: UserRole[]): UserRole {
  const order: UserRole[] = [
    "SUPER_ADMIN",
    "ADMIN",
    "PROJECT_MANAGER",
    "SALESPERSON",
  ];
  for (const role of order) {
    if (roles.includes(role)) return role;
  }
  return roles[0];
}
