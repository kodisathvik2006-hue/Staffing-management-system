import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  requirePermission,
  errorResponse,
  jsonResponse,
  getTenantId,
} from "@/lib/auth";
import { vendorSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission("vendor:read");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );
    const search = request.nextUrl.searchParams.get("search") ?? "";

    const vendors = await prisma.vendor.findMany({
      where: {
        selfEntityId: tenantId,
        ...(search
          ? {
              OR: [
                { legalName: { contains: search, mode: "insensitive" } },
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { legalName: "asc" },
    });

    return jsonResponse({ data: vendors });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission("vendor:write");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );

    const body = await request.json();
    const parsed = vendorSchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse(
        { error: "Validation failed", details: parsed.error.flatten() },
        400
      );
    }

    const vendor = await prisma.vendor.create({
      data: { ...parsed.data, selfEntityId: tenantId },
    });

    return jsonResponse({ data: vendor }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
