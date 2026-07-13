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
import { projectUpdateSchema } from "@/lib/validations";
import { calculateProjectFinancials, toNumber } from "@/lib/financials";

type RouteParams = { params: Promise<{ id: string }> };

async function getProjectForTenant(id: string, tenantId: string) {
  const project = await prisma.project.findFirst({
    where: { id, selfEntityId: tenantId },
    include: {
      client: true,
      consultant: true,
      upstreamVendor: true,
      downstreamVendor: true,
      template: true,
      salespeople: {
        include: { salesperson: true },
      },
      commissionRules: {
        include: { salesperson: { select: { firstName: true, lastName: true } } },
      },
      documents: {
        include: {
          versions: {
            orderBy: { version: "desc" },
            take: 1,
            include: { uploadedBy: { select: { firstName: true, lastName: true } } },
          },
        },
      },
      statusHistory: {
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });
  if (!project) throw new ApiError(404, "Project not found");
  return project;
}

function serializeProject(project: Awaited<ReturnType<typeof getProjectForTenant>>) {
  const financials = calculateProjectFinancials({
    clientRatePerHour: toNumber(project.clientRatePerHour),
    payRatePerHour: toNumber(project.payRatePerHour),
    hoursWorked: 0,
    commissionRules: project.commissionRules.map((r) => ({
      type: r.type,
      currency: r.currency,
      amount: toNumber(r.amount),
      percent: toNumber(r.percent),
    })),
  });

  return {
    ...project,
    clientRatePerHour: toNumber(project.clientRatePerHour),
    payRatePerHour: toNumber(project.payRatePerHour),
    markupPerHour: financials.markupPerHour,
    financials,
    commissionRules: project.commissionRules.map((r) => ({
      ...r,
      amount: toNumber(r.amount),
      percent: toNumber(r.percent),
    })),
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requirePermission("project:read");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );
    const { id } = await params;
    const project = await getProjectForTenant(id, tenantId);
    return jsonResponse({ data: serializeProject(project) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requirePermission("project:write");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );
    const { id } = await params;
    await getProjectForTenant(id, tenantId);

    const body = await request.json();
    const parsed = projectUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonResponse(
        { error: "Validation failed", details: parsed.error.flatten() },
        400
      );
    }

    const { startDate, invoiceEmail, ...projectData } = parsed.data;

    const updateData: Record<string, unknown> = { ...projectData };
    if (startDate !== undefined) {
      updateData.startDate = startDate ? new Date(startDate) : null;
    }
    if (invoiceEmail !== undefined) {
      updateData.invoiceEmail = invoiceEmail || null;
    }



    const project = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    await logAudit({
      selfEntityId: tenantId,
      userId: session.sub,
      action: "UPDATE",
      resource: "project",
      resourceId: id,
      ipAddress: getClientIp(request),
    });

    return jsonResponse({ data: project });
  } catch (error) {
    return errorResponse(error);
  }
}
