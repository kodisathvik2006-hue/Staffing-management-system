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
import { templateSchema } from "@/lib/validations";
import { toNumber } from "@/lib/financials";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requirePermission("template:read");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );
    const { id } = await params;

    const template = await prisma.projectTemplate.findFirst({
      where: { id, selfEntityId: tenantId },
      include: {
        commissionDefaults: true,
        requiredDocuments: true,
      },
    });

    if (!template) throw new ApiError(404, "Template not found");

    return jsonResponse({
      data: {
        ...template,
        defaultClientRate: toNumber(template.defaultClientRate),
        defaultPayRate: toNumber(template.defaultPayRate),
        markupTarget: toNumber(template.markupTarget),
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requirePermission("template:write");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );
    const { id } = await params;

    const existing = await prisma.projectTemplate.findFirst({
      where: { id, selfEntityId: tenantId },
    });
    if (!existing) throw new ApiError(404, "Template not found");

    const body = await request.json();
    const parsed = templateSchema.partial().safeParse(body);
    if (!parsed.success) {
      return jsonResponse(
        { error: "Validation failed", details: parsed.error.flatten() },
        400
      );
    }

    const { commissionDefaults, requiredDocuments, ...templateData } =
      parsed.data;

    if (commissionDefaults) {
      await prisma.templateCommissionDefault.deleteMany({
        where: { templateId: id },
      });
      await prisma.templateCommissionDefault.createMany({
        data: commissionDefaults.map((c) => ({ ...c, templateId: id })),
      });
    }

    if (requiredDocuments) {
      await prisma.templateRequiredDocument.deleteMany({
        where: { templateId: id },
      });
      await prisma.templateRequiredDocument.createMany({
        data: requiredDocuments.map((documentType) => ({
          templateId: id,
          documentType,
        })),
      });
    }

    const template = await prisma.projectTemplate.update({
      where: { id },
      data: templateData,
      include: {
        commissionDefaults: true,
        requiredDocuments: true,
      },
    });

    await logAudit({
      selfEntityId: tenantId,
      userId: session.sub,
      action: "UPDATE",
      resource: "template",
      resourceId: id,
      ipAddress: getClientIp(request),
    });

    return jsonResponse({ data: template });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requirePermission("template:write");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );
    const { id } = await params;

    const existing = await prisma.projectTemplate.findFirst({
      where: { id, selfEntityId: tenantId },
    });
    if (!existing) throw new ApiError(404, "Template not found");

    await prisma.projectTemplate.update({
      where: { id },
      data: { isActive: false },
    });

    await logAudit({
      selfEntityId: tenantId,
      userId: session.sub,
      action: "DELETE",
      resource: "template",
      resourceId: id,
      ipAddress: getClientIp(request),
    });

    return jsonResponse({ data: { success: true } });
  } catch (error) {
    return errorResponse(error);
  }
}
