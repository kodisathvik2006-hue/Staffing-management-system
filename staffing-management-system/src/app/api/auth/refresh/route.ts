import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  buildTokenPayload,
  errorResponse,
  hashToken,
  jsonResponse,
} from "@/lib/auth";
import {
  REFRESH_COOKIE,
  setAuthCookies,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
    if (!refreshToken) {
      return jsonResponse({ error: "No refresh token" }, 401);
    }

    const userId = await verifyRefreshToken(refreshToken);
    if (!userId) {
      return jsonResponse({ error: "Invalid refresh token" }, 401);
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(refreshToken) },
    });

    if (!stored || stored.expiresAt < new Date()) {
      return jsonResponse({ error: "Refresh token expired" }, 401);
    }

    const payload = await buildTokenPayload(userId);
    const newAccessToken = await signAccessToken(payload);
    const newRefreshToken = await signRefreshToken(userId);

    await prisma.refreshToken.delete({ where: { id: stored.id } });
    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashToken(newRefreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await setAuthCookies(newAccessToken, newRefreshToken);

    return jsonResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
