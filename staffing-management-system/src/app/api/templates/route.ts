import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  requirePermission,
  errorResponse,
  jsonResponse,
  getTenantId,
  logAudit,
  getClientIp,
} from "@/lib/auth";
import { templateSchema } from "@/lib/validations";
import { toNumber } from "@/lib/financials";

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission("template:read");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );

    const templates = await prisma.projectTemplate.findMany({
      where: { selfEntityId: tenantId },
      include: {
        commissionDefaults: true,
        requiredDocuments: true,
        _count: { select: { projects: true } },
      },
      orderBy: { name: "asc" },
    });

    const data = templates.map((t) => ({
      ...t,
      defaultClientRate: toNumber(t.defaultClientRate),
      defaultPayRate: toNumber(t.defaultPayRate),
      markupTarget: toNumber(t.markupTarget),
      commissionDefaults: t.commissionDefaults.map((c) => ({
        ...c,
        amount: toNumber(c.amount),
        percent: toNumber(c.percent),
      })),
    }));

    return jsonResponse({ data });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission("template:write");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );

    const body = await request.json();
    const parsed = templateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonResponse(
        { error: "Validation failed", details: parsed.error.flatten() },
        400
      );
    }

    const { commissionDefaults, requiredDocuments, ...templateData } =
      parsed.data;

    const template = await prisma.projectTemplate.create({
      data: {
        ...templateData,
        selfEntityId: tenantId,
        commissionDefaults: {
          create: commissionDefaults,
        },
        requiredDocuments: {
          create: requiredDocuments.map((documentType) => ({ documentType })),
        },
      },
      include: {
        commissionDefaults: true,
        requiredDocuments: true,
      },
    });

    await logAudit({
      selfEntityId: tenantId,
      userId: session.sub,
      action: "CREATE",
      resource: "template",
      resourceId: template.id,
      ipAddress: getClientIp(request),
    });

    return jsonResponse({ data: template }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
