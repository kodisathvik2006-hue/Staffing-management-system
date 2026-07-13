import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  errorResponse,
  getClientIp,
  jsonResponse,
  logAudit,
  verifyPassword,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { setAuthCookies, signAccessToken, signRefreshToken } from "@/lib/jwt";

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

    const consultant = await prisma.consultant.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!consultant) {
      return jsonResponse({ error: "Invalid email or password" }, 401);
    }

    if (consultant.status !== "ACTIVE") {
      return jsonResponse({ error: "Your account has been deactivated." }, 401);
    }

    if (!consultant.passwordHash) {
      return jsonResponse({ error: "Invalid email or password" }, 401);
    }

    const valid = await verifyPassword(password, consultant.passwordHash);
    if (!valid) {
      return jsonResponse({ error: "Invalid email or password" }, 401);
    }

    // Update last login
    await prisma.consultant.update({
      where: { id: consultant.id },
      data: { lastLogin: new Date() },
    });

    // Build JWT Payload
    const payload = {
      sub: consultant.id,
      email: consultant.email!,
      firstName: consultant.firstName,
      lastName: consultant.lastName,
      roles: [{ selfEntityId: consultant.selfEntityId, role: "CONSULTANT" as any }],
      vendorId: consultant.vendorId || undefined,
    };

    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(consultant.id);
    await setAuthCookies(accessToken, refreshToken);

    await logAudit({
      selfEntityId: consultant.selfEntityId,
      action: "CONSULTANT_LOGIN",
      resource: "consultant",
      resourceId: consultant.id,
      ipAddress: getClientIp(request),
    });

    return jsonResponse({
      user: {
        id: consultant.id,
        email: consultant.email,
        name: `${consultant.firstName} ${consultant.lastName}`,
        role: "consultant",
      },
    });
  } catch (error) {
    console.error("Consultant login error:", error);
    return jsonResponse({ error: "An unexpected error occurred during login. Please try again later." }, 500);
  }
}
