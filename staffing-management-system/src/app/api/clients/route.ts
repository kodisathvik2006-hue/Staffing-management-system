import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  requirePermission,
  errorResponse,
  jsonResponse,
  getTenantId,
} from "@/lib/auth";
import { clientSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission("client:read");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );
    const search = request.nextUrl.searchParams.get("search") ?? "";

    const clients = await prisma.client.findMany({
      where: {
        selfEntityId: tenantId,
        ...(search
          ? {
              OR: [
                { legalName: { contains: search, mode: "insensitive" } },
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { emailAddresses: { has: search } },
              ],
            }
          : {}),
      },
      orderBy: { legalName: "asc" },
    });

    return jsonResponse({ data: clients });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission("client:write");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );

    const body = await request.json();
    const parsed = clientSchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse(
        { error: "Validation failed", details: parsed.error.flatten() },
        400
      );
    }

    const client = await prisma.client.create({
      data: { ...parsed.data, selfEntityId: tenantId },
    });

    return jsonResponse({ data: client }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
