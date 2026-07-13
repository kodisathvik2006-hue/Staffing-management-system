import { NextRequest } from "next/server";
import { getSession } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import { jsonResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.roles.some((r) => r.role === "CONSULTANT")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const timesheets = await prisma.timesheet.findMany({
      where: { consultantId: session.sub },
      include: { project: true },
      orderBy: { weekEndingDate: "desc" },
    });

    // Serialize Decimals for JSON response
    const serialized = timesheets.map(ts => ({
      ...ts,
      hoursWorked: ts.hoursWorked ? ts.hoursWorked.toNumber() : 0,
      mondayHours: ts.mondayHours ? ts.mondayHours.toNumber() : 0,
      tuesdayHours: ts.tuesdayHours ? ts.tuesdayHours.toNumber() : 0,
      wednesdayHours: ts.wednesdayHours ? ts.wednesdayHours.toNumber() : 0,
      thursdayHours: ts.thursdayHours ? ts.thursdayHours.toNumber() : 0,
      fridayHours: ts.fridayHours ? ts.fridayHours.toNumber() : 0,
      saturdayHours: ts.saturdayHours ? ts.saturdayHours.toNumber() : 0,
      sundayHours: ts.sundayHours ? ts.sundayHours.toNumber() : 0,
    }));

    return jsonResponse(serialized);
  } catch (error) {
    console.error("GET Timesheets Error:", error);
    return jsonResponse({ error: "Failed to fetch timesheets" }, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.roles.some((r) => r.role === "CONSULTANT")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const body = await req.json();
    const {
      projectId,
      weekEndingDate,
      mondayHours,
      tuesdayHours,
      wednesdayHours,
      thursdayHours,
      fridayHours,
      saturdayHours,
      sundayHours,
      taskDescription,
      workSummary,
      comments,
      status
    } = body;

    // Verify Project assignment
    const project = await prisma.project.findFirst({
      where: { id: projectId, consultantId: session.sub },
      include: { client: true }
    });

    if (!project) {
      return jsonResponse({ error: "Invalid project" }, 400);
    }

    // Check duplicate
    const existing = await prisma.timesheet.findFirst({
      where: { consultantId: session.sub, weekEndingDate: new Date(weekEndingDate), projectId }
    });

    if (existing) {
      return jsonResponse({ error: "A timesheet for this project and week already exists." }, 400);
    }

    const hoursWorked = (mondayHours || 0) + (tuesdayHours || 0) + (wednesdayHours || 0) + (thursdayHours || 0) + (fridayHours || 0) + (saturdayHours || 0) + (sundayHours || 0);

    const newTs = await prisma.timesheet.create({
      data: {
        projectId,
        consultantId: session.sub,
        clientId: project.clientId,
        weekEndingDate: new Date(weekEndingDate),
        submittedDate: status === "SUBMITTED" ? new Date() : null,
        hoursWorked,
        mondayHours: mondayHours || 0,
        tuesdayHours: tuesdayHours || 0,
        wednesdayHours: wednesdayHours || 0,
        thursdayHours: thursdayHours || 0,
        fridayHours: fridayHours || 0,
        saturdayHours: saturdayHours || 0,
        sundayHours: sundayHours || 0,
        taskDescription,
        workSummary,
        comments,
        status: status === "Pending Approval" || status === "Pending" ? "Pending Approval" : "Draft"
      },
      include: { project: true }
    });

    if (status === "Pending Approval" || status === "Pending") {
      await prisma.auditLog.create({
        data: {
          selfEntityId: project.selfEntityId,
          userId: session.sub,
          action: "Consultant Submitted",
          resource: "Timesheet",
          resourceId: newTs.id,
          metadata: { weekEndingDate, hoursWorked }
        }
      });
      // Optionally notify admin (create notification)
    }

    return jsonResponse(newTs, 201);
  } catch (error) {
    console.error("POST Timesheet Error:", error);
    return jsonResponse({ error: "Failed to create timesheet" }, 500);
  }
}
