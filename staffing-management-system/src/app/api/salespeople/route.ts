import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  requirePermission,
  errorResponse,
  jsonResponse,
  getTenantId,
} from "@/lib/auth";
import { salespersonSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission("salesperson:read");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );
    const search = request.nextUrl.searchParams.get("search") ?? "";

    const salespeople = await prisma.salesperson.findMany({
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

    return jsonResponse({ data: salespeople });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission("salesperson:write");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );

    const body = await request.json();
    const parsed = salespersonSchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse(
        { error: "Validation failed", details: parsed.error.flatten() },
        400
      );
    }

    const salesperson = await prisma.salesperson.create({
      data: {
        ...parsed.data,
        personalEmail: parsed.data.personalEmail || null,
        selfEntityId: tenantId,
      },
    });

    return jsonResponse({ data: salesperson }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
