import { NextRequest } from "next/server";
import { getSession } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import { jsonResponse } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !session.roles.some((r) => r.role === "ADMIN" || r.role === "SUPER_ADMIN")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();

    const { status, comments } = body;

    const existing = await prisma.timesheet.findUnique({ where: { id }, include: { consultant: true, project: true } });
    if (!existing) {
      return jsonResponse({ error: "Timesheet not found" }, 404);
    }

    const updated = await prisma.timesheet.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === "Rejected" ? (comments || null) : null,
        approvedBy: status === "Approved" ? session.sub : null,
        approvedAt: status === "Approved" ? new Date() : null,
        rejectedBy: status === "Rejected" ? session.sub : null,
        rejectedAt: status === "Rejected" ? new Date() : null,
      },
    });

    await prisma.auditLog.create({
      data: {
        selfEntityId: existing.project?.selfEntityId,
        userId: session.sub,
        action: status === "Approved" ? "Admin Approved" : (status === "Rejected" ? "Admin Rejected" : "Admin Updated"),
        resource: "Timesheet",
        resourceId: id,
        metadata: { status, comments }
      }
    });

    // Create notification for consultant
    let message = `Your timesheet for week ending ${existing.weekEndingDate.toLocaleDateString()} has been ${status.toLowerCase()}.`;
    if (comments) {
      message += ` Admin comments: ${comments}`;
    }

    // We log the notification but omit the strict userId foreign key logic here
    // since Consultant and User accounts may not share the exact same ID.
    console.log(`Notification to Consultant ${existing.consultant.id}: ${message}`);

    return jsonResponse(updated);
  } catch (error) {
    console.error("PUT Admin Timesheet Error:", error);
    return jsonResponse({ error: "Failed to process timesheet" }, 500);
  }
}
