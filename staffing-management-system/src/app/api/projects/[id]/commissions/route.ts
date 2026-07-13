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
import { commissionRuleSchema } from "@/lib/validations";
import { toNumber } from "@/lib/financials";

type RouteParams = { params: Promise<{ id: string }> };

async function getProjectForTenant(id: string, tenantId: string) {
  const project = await prisma.project.findFirst({
    where: { id, selfEntityId: tenantId },
  });
  if (!project) throw new ApiError(404, "Project not found");
  return project;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requirePermission("commission:read");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );
    const { id } = await params;
    await getProjectForTenant(id, tenantId);

    const rules = await prisma.commissionRule.findMany({
      where: { projectId: id },
      include: { salesperson: { select: { firstName: true, lastName: true } } },
    });

    return jsonResponse({
      data: rules.map((r) => ({
        ...r,
        amount: toNumber(r.amount),
        percent: toNumber(r.percent),
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requirePermission("commission:write");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );
    const { id } = await params;
    await getProjectForTenant(id, tenantId);

    const body = await request.json();
    const parsed = commissionRuleSchema.safeParse(body);
    if (!parsed.success) {
      return jsonResponse(
        { error: "Validation failed", details: parsed.error.flatten() },
        400
      );
    }

    const rule = await prisma.commissionRule.create({
      data: { ...parsed.data, projectId: id },
      include: { salesperson: { select: { firstName: true, lastName: true } } },
    });

    await logAudit({
      selfEntityId: tenantId,
      userId: session.sub,
      action: "CREATE",
      resource: "commission_rule",
      resourceId: rule.id,
      ipAddress: getClientIp(request),
    });

    return jsonResponse(
      {
        data: {
          ...rule,
          amount: toNumber(rule.amount),
          percent: toNumber(rule.percent),
        },
      },
      201
    );
  } catch (error) {
    return errorResponse(error);
  }
}
