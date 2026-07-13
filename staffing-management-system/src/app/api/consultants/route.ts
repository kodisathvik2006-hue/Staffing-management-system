import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  requirePermission,
  errorResponse,
  jsonResponse,
  getTenantId,
} from "@/lib/auth";
import { consultantSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission("consultant:read");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );
    const search = request.nextUrl.searchParams.get("search") ?? "";

    const consultants = await prisma.consultant.findMany({
      where: {
        selfEntityId: tenantId,
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    });

    return jsonResponse({ data: consultants });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission("consultant:write");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );

    const body = await request.json();
    const parsed = consultantSchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse(
        { error: "Validation failed", details: parsed.error.flatten() },
        400
      );
    }

    const consultant = await prisma.consultant.create({
      data: {
        ...parsed.data,
        personalEmail: parsed.data.personalEmail || null,
        selfEntityId: tenantId,
      },
    });

    return jsonResponse({ data: consultant }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
