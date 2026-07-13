import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  requirePermission,
  errorResponse,
  jsonResponse,
  getTenantId,
  logAudit,
  getClientIp,
  ApiError,
} from "@/lib/auth";
import { clientSchema } from "@/lib/validations";

type RouteParams = { params: Promise<{ id: string }> };

async function getClientForTenant(id: string, tenantId: string) {
  const client = await prisma.client.findFirst({
    where: { id, selfEntityId: tenantId },
  });
  if (!client) throw new ApiError(404, "Client not found");
  return client;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requirePermission("client:read");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );
    const { id } = await params;
    const client = await getClientForTenant(id, tenantId);
    return jsonResponse({ data: client });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requirePermission("client:write");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );
    const { id } = await params;
    await getClientForTenant(id, tenantId);

    const body = await request.json();
    const parsed = clientSchema.partial().safeParse(body);
    if (!parsed.success) {
      return jsonResponse(
        { error: "Validation failed", details: parsed.error.flatten() },
        400
      );
    }

    const client = await prisma.client.update({
      where: { id },
      data: parsed.data,
    });

    await logAudit({
      selfEntityId: tenantId,
      userId: session.sub,
      action: "UPDATE",
      resource: "client",
      resourceId: id,
      ipAddress: getClientIp(request),
    });

    return jsonResponse({ data: client });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requirePermission("client:write");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );
    const { id } = await params;
    await getClientForTenant(id, tenantId);

    await prisma.client.update({
      where: { id },
      data: { status: "INACTIVE" },
    });

    await logAudit({
      selfEntityId: tenantId,
      userId: session.sub,
      action: "DELETE",
      resource: "client",
      resourceId: id,
      ipAddress: getClientIp(request),
    });

    return jsonResponse({ data: { success: true } });
  } catch (error) {
    return errorResponse(error);
  }
}
