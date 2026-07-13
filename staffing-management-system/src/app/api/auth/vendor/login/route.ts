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
import crypto from "crypto";

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

    const vendor = await prisma.vendor.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!vendor) {
      return jsonResponse({ error: "Invalid email or password" }, 401);
    }

    if (vendor.status !== "ACTIVE") {
      return jsonResponse({ error: "Your account has been deactivated." }, 401);
    }

    if (!vendor.passwordHash) {
      return jsonResponse({ error: "Invalid email or password" }, 401);
    }

    const valid = await verifyPassword(password, vendor.passwordHash);
    if (!valid) {
      return jsonResponse({ error: "Invalid email or password" }, 401);
    }

    // Update last login
    await prisma.vendor.update({
      where: { id: vendor.id },
      data: { lastLogin: new Date() },
    });

    // Build JWT Payload
    const payload = {
      sub: vendor.id,
      email: vendor.email!,
      firstName: vendor.legalName,
      lastName: "",
      roles: [{ selfEntityId: vendor.selfEntityId, role: "VENDOR" as any }],
      vendorId: vendor.id,
      companyName: vendor.legalName,
    };

    const accessToken = await signAccessToken(payload);
    // For vendors, we might skip saving refresh token to DB due to FK constraints,
    // but we can still sign and send one so cookies match.
    const refreshToken = await signRefreshToken(vendor.id);
    await setAuthCookies(accessToken, refreshToken);

    await logAudit({
      selfEntityId: vendor.selfEntityId,
      action: "VENDOR_LOGIN",
      resource: "vendor",
      resourceId: vendor.id,
      ipAddress: getClientIp(request),
    });

    return jsonResponse({
      user: {
        id: vendor.id,
        email: vendor.email,
        companyName: vendor.legalName,
        role: "vendor",
      },
    });
  } catch (error: any) {
    console.error("Vendor login error:", error);
    // Return the actual error message for easier debugging
    return jsonResponse({ error: error.message || "An unexpected error occurred during login. Please try again later." }, 500);
  }
}
