import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  requirePermission,
  requireAuth,
  errorResponse,
  jsonResponse,
  getTenantId,
  logAudit,
  getClientIp,
  ApiError,
} from "@/lib/auth";
import { salespersonSchema } from "@/lib/validations";

type RouteParams = { params: Promise<{ id: string }> };

async function getSalespersonForTenant(id: string, tenantId: string) {
  const salesperson = await prisma.salesperson.findFirst({
    where: { id, selfEntityId: tenantId },
  });
  if (!salesperson) throw new ApiError(404, "Salesperson not found");
  return salesperson;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requirePermission("salesperson:read");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );
    const { id } = await params;
    const salesperson = await getSalespersonForTenant(id, tenantId);
    return jsonResponse({ data: salesperson });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requirePermission("salesperson:write");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );
    const { id } = await params;
    await getSalespersonForTenant(id, tenantId);

    const body = await request.json();
    const parsed = salespersonSchema.partial().safeParse(body);
    if (!parsed.success) {
      return jsonResponse(
        { error: "Validation failed", details: parsed.error.flatten() },
        400
      );
    }

    const salesperson = await prisma.salesperson.update({
      where: { id },
      data: {
        ...parsed.data,
        personalEmail: parsed.data.personalEmail || null,
      },
    });

    await logAudit({
      selfEntityId: tenantId,
      userId: session.sub,
      action: "UPDATE",
      resource: "salesperson",
      resourceId: id,
      ipAddress: getClientIp(request),
    });

    return jsonResponse({ data: salesperson });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requirePermission("salesperson:write");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );
    const { id } = await params;
    await getSalespersonForTenant(id, tenantId);

    await prisma.salesperson.update({
      where: { id },
      data: { status: "INACTIVE" },
    });

    await logAudit({
      selfEntityId: tenantId,
      userId: session.sub,
      action: "DELETE",
      resource: "salesperson",
      resourceId: id,
      ipAddress: getClientIp(request),
    });

    return jsonResponse({ data: { success: true } });
  } catch (error) {
    return errorResponse(error);
  }
}
