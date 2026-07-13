import { NextRequest } from "next/server";
import { getSession } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import { jsonResponse } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !session.roles.some((r) => r.role === "CONSULTANT")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }
    
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();

    const existing = await prisma.timesheet.findUnique({ where: { id } });
    if (!existing || existing.consultantId !== session.sub) {
      return jsonResponse({ error: "Timesheet not found" }, 404);
    }

    const allowedStatuses = ["DRAFT", "Draft", "RETURNED", "Returned", "REJECTED", "Rejected"];
    if (!allowedStatuses.includes(existing.status)) {
      return jsonResponse({ error: "Cannot edit a timesheet in " + existing.status + " status" }, 400);
    }

    const {
      mondayHours, tuesdayHours, wednesdayHours, thursdayHours, fridayHours, saturdayHours, sundayHours,
      taskDescription, workSummary, comments, status
    } = body;

    const hoursWorked = (mondayHours || 0) + (tuesdayHours || 0) + (wednesdayHours || 0) + (thursdayHours || 0) + (fridayHours || 0) + (saturdayHours || 0) + (sundayHours || 0);

    const updated = await prisma.timesheet.update({
      where: { id },
      data: {
        hoursWorked,
        mondayHours, tuesdayHours, wednesdayHours, thursdayHours, fridayHours, saturdayHours, sundayHours,
        taskDescription, workSummary, comments,
        status: status === "Pending Approval" || status === "Pending" ? "Pending Approval" : "Draft"
      },
      include: { project: true }
    });

    if (status === "Pending Approval" || status === "Pending") {
      await prisma.auditLog.create({
        data: {
          selfEntityId: existing.project?.selfEntityId,
          userId: session.sub,
          action: "Consultant Resubmitted",
          resource: "Timesheet",
          resourceId: existing.id,
          metadata: { hoursWorked }
        }
      });
    }

    return jsonResponse(updated);
  } catch (error) {
    console.error("PUT Timesheet Error:", error);
    return jsonResponse({ error: "Failed to update timesheet" }, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !session.roles.some((r) => r.role === "CONSULTANT")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }
    
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const existing = await prisma.timesheet.findUnique({ where: { id } });
    if (!existing || existing.consultantId !== session.sub) {
      return jsonResponse({ error: "Timesheet not found" }, 404);
    }

    const allowedDeleteStatuses = ["DRAFT", "Draft"];
    if (!allowedDeleteStatuses.includes(existing.status)) {
      return jsonResponse({ error: "Can only delete draft timesheets" }, 400);
    }

    await prisma.timesheet.delete({ where: { id } });
    return jsonResponse({ success: true });
  } catch (error) {
    console.error("DELETE Timesheet Error:", error);
    return jsonResponse({ error: "Failed to delete timesheet" }, 500);
  }
}
