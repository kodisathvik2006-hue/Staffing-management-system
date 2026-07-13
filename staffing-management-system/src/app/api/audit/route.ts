import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  requirePermission,
  errorResponse,
  jsonResponse,
  getTenantId,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission("audit:read");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );

    const limit = Math.min(
      parseInt(request.nextUrl.searchParams.get("limit") ?? "50", 10),
      100
    );
    const resource = request.nextUrl.searchParams.get("resource");

    const logs = await prisma.auditLog.findMany({
      where: {
        selfEntityId: tenantId,
        ...(resource ? { resource } : {}),
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return jsonResponse({ data: logs });
  } catch (error) {
    return errorResponse(error);
  }
}
