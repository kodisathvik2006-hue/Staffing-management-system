import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  createAuthTokens,
  errorResponse,
  getClientIp,
  jsonResponse,
  logAudit,
  verifyPassword,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { clearAuthCookies, setAuthCookies } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse(
        { error: "Validation failed", details: parsed.error.flatten() },
        400
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { entityRoles: true },
    });

    if (!user || !user.isActive) {
      return jsonResponse({ error: "Invalid email or password" }, 401);
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return jsonResponse({ error: "Invalid email or password" }, 401);
    }

    const { accessToken, refreshToken, payload } = await createAuthTokens(
      user.id
    );

    await setAuthCookies(accessToken, refreshToken);

    await logAudit({
      userId: user.id,
      action: "LOGIN",
      resource: "user",
      resourceId: user.id,
      ipAddress: getClientIp(request),
    });

    return jsonResponse({
      user: {
        id: payload.sub,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        roles: payload.roles,
        vendorId: payload.vendorId,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE() {
  try {
    await clearAuthCookies();
    return jsonResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
