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
import { vendorSchema } from "@/lib/validations";

type RouteParams = { params: Promise<{ id: string }> };

async function getVendorForTenant(id: string, tenantId: string) {
  const vendor = await prisma.vendor.findFirst({
    where: { id, selfEntityId: tenantId },
  });
  if (!vendor) throw new ApiError(404, "Vendor not found");
  return vendor;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requirePermission("vendor:read");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );
    const { id } = await params;
    const vendor = await getVendorForTenant(id, tenantId);
    return jsonResponse({ data: vendor });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requirePermission("vendor:write");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );
    const { id } = await params;
    await getVendorForTenant(id, tenantId);

    const body = await request.json();
    const parsed = vendorSchema.partial().safeParse(body);
    if (!parsed.success) {
      return jsonResponse(
        { error: "Validation failed", details: parsed.error.flatten() },
        400
      );
    }

    const vendor = await prisma.vendor.update({
      where: { id },
      data: parsed.data,
    });

    await logAudit({
      selfEntityId: tenantId,
      userId: session.sub,
      action: "UPDATE",
      resource: "vendor",
      resourceId: id,
      ipAddress: getClientIp(request),
    });

    return jsonResponse({ data: vendor });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requirePermission("vendor:write");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );
    const { id } = await params;
    await getVendorForTenant(id, tenantId);

    await prisma.vendor.update({
      where: { id },
      data: { status: "INACTIVE" },
    });

    await logAudit({
      selfEntityId: tenantId,
      userId: session.sub,
      action: "DELETE",
      resource: "vendor",
      resourceId: id,
      ipAddress: getClientIp(request),
    });

    return jsonResponse({ data: { success: true } });
  } catch (error) {
    return errorResponse(error);
  }
}
