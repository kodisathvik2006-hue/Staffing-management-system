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
import { projectStatusSchema } from "@/lib/validations";
import { canTransition } from "@/lib/status-transitions";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requirePermission("project:status");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );
    const { id } = await params;

    const project = await prisma.project.findFirst({
      where: { id, selfEntityId: tenantId },
    });
    if (!project) throw new ApiError(404, "Project not found");

    const body = await request.json();
    const parsed = projectStatusSchema.safeParse(body);
    if (!parsed.success) {
      return jsonResponse(
        { error: "Validation failed", details: parsed.error.flatten() },
        400
      );
    }

    const { status: newStatus, reason } = parsed.data;

    if (!canTransition(project.status, newStatus)) {
      return jsonResponse(
        {
          error: `Cannot transition from ${project.status} to ${newStatus}`,
        },
        400
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const proj = await tx.project.update({
        where: { id },
        data: { status: newStatus },
      });

      await tx.projectStatusHistory.create({
        data: {
          projectId: id,
          fromStatus: project.status,
          toStatus: newStatus,
          changedBy: session.sub,
          reason,
        },
      });

      return proj;
    });

    await logAudit({
      selfEntityId: tenantId,
      userId: session.sub,
      action: "STATUS_CHANGE",
      resource: "project",
      resourceId: id,
      metadata: { from: project.status, to: newStatus, reason },
      ipAddress: getClientIp(request),
    });

    return jsonResponse({ data: updated });
  } catch (error) {
    return errorResponse(error);
  }
}
