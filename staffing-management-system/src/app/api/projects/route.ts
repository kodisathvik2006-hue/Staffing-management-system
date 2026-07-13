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
import { projectSchema } from "@/lib/validations";
import { calculateProjectFinancials, toNumber } from "@/lib/financials";

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission("project:read");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );
    const status = request.nextUrl.searchParams.get("status");

    const projects = await prisma.project.findMany({
      where: {
        selfEntityId: tenantId,
        ...(status ? { status: status as never } : {}),
      },
      include: {
        client: { select: { legalName: true } },
        consultant: { select: { firstName: true, lastName: true } },
        salespeople: {
          include: { salesperson: { select: { firstName: true, lastName: true } } },
        },
        commissionRules: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    const data = projects.map((p) => {
      const financials = calculateProjectFinancials({
        clientRatePerHour: toNumber(p.clientRatePerHour),
        payRatePerHour: toNumber(p.payRatePerHour),
        hoursWorked: 0,
        commissionRules: p.commissionRules.map((r) => ({
          type: r.type,
          currency: r.currency,
          amount: toNumber(r.amount),
          percent: toNumber(r.percent),
        })),
      });

      return {
        ...p,
        clientRatePerHour: toNumber(p.clientRatePerHour),
        payRatePerHour: toNumber(p.payRatePerHour),
        markupPerHour: financials.markupPerHour,
      };
    });

    return jsonResponse({ data });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission("project:write");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );

    const body = await request.json();
    const parsed = projectSchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse(
        { error: "Validation failed", details: parsed.error.flatten() },
        400
      );
    }

    const {
      commissionRules,
      startDate,
      invoiceEmail,
      templateId,
      salespersonId,
      ...projectData
    } = parsed.data;

    let templateDefaults: Record<string, unknown> = {};
    let templateCommissionRules = commissionRules;
    let templateDocuments: string[] = [];

    if (templateId) {
      const template = await prisma.projectTemplate.findFirst({
        where: { id: templateId, selfEntityId: tenantId },
        include: {
          commissionDefaults: true,
          requiredDocuments: true,
        },
      });

      if (template) {
        templateDefaults = {
          templateId,
          invoiceSchedule:
            projectData.invoiceSchedule ?? template.invoiceSchedule,
          paymentTerms: projectData.paymentTerms ?? template.paymentTerms,
          paymentMode: projectData.paymentMode ?? template.paymentMode,
          clientRatePerHour:
            projectData.clientRatePerHour ??
            (template.defaultClientRate
              ? Number(template.defaultClientRate)
              : undefined),
          payRatePerHour:
            projectData.payRatePerHour ??
            (template.defaultPayRate
              ? Number(template.defaultPayRate)
              : undefined),
          currency: projectData.currency ?? template.currency,
        };



        templateDocuments = template.requiredDocuments.map(
          (d) => d.documentType
        );
      }
    }

    const project = await prisma.project.create({
      data: {
        ...projectData,
        ...templateDefaults,
        selfEntityId: tenantId,
        startDate: startDate ? new Date(startDate) : null,
        invoiceEmail: invoiceEmail || null,

        documents: {
          create: templateDocuments.map((documentType) => ({
            documentType: documentType as never,
            title: documentType.replace(/_/g, " "),
            isRequired: true,
          })),
        },
        salespeople: salespersonId ? {
          create: [{ salespersonId }]
        } : undefined,
        statusHistory: {
          create: {
            toStatus: "DRAFT",
            changedBy: session.sub,
            reason: templateId
              ? "Project created from template"
              : "Project created",
          },
        },
      },
      include: {
        client: true,
        consultant: true,
        commissionRules: true,
      },
    });

    await logAudit({
      selfEntityId: tenantId,
      userId: session.sub,
      action: "CREATE",
      resource: "project",
      resourceId: project.id,
      ipAddress: getClientIp(request),
    });

    return jsonResponse({ data: project }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
