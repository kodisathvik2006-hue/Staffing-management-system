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
import { consultantSchema } from "@/lib/validations";

type RouteParams = { params: Promise<{ id: string }> };

async function getConsultantForTenant(id: string, tenantId: string) {
  const consultant = await prisma.consultant.findFirst({
    where: { id, selfEntityId: tenantId },
  });
  if (!consultant) throw new ApiError(404, "Consultant not found");
  return consultant;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requirePermission("consultant:read");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );
    const { id } = await params;
    const consultant = await getConsultantForTenant(id, tenantId);
    return jsonResponse({ data: consultant });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requirePermission("consultant:write");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );
    const { id } = await params;
    await getConsultantForTenant(id, tenantId);

    const body = await request.json();
    const parsed = consultantSchema.partial().safeParse(body);
    if (!parsed.success) {
      return jsonResponse(
        { error: "Validation failed", details: parsed.error.flatten() },
        400
      );
    }

    const consultant = await prisma.consultant.update({
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
      resource: "consultant",
      resourceId: id,
      ipAddress: getClientIp(request),
    });

    return jsonResponse({ data: consultant });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requirePermission("consultant:write");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );
    const { id } = await params;
    await getConsultantForTenant(id, tenantId);

    await prisma.consultant.update({
      where: { id },
      data: { status: "INACTIVE" },
    });

    await logAudit({
      selfEntityId: tenantId,
      userId: session.sub,
      action: "DELETE",
      resource: "consultant",
      resourceId: id,
      ipAddress: getClientIp(request),
    });

    return jsonResponse({ data: { success: true } });
  } catch (error) {
    return errorResponse(error);
  }
}
