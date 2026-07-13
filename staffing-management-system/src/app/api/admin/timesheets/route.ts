import { NextRequest } from "next/server";
import { getSession } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import { jsonResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.roles.some((r) => r.role === "ADMIN" || r.role === "SUPER_ADMIN")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const timesheets = await prisma.timesheet.findMany({
      where: {
        project: {
          selfEntityId: session.roles[0].selfEntityId, // Ensure they only see timesheets for their tenant
        }
      },
      include: {
        project: { include: { client: true } },
        consultant: { include: { vendor: true } },
      },
      orderBy: [
        { status: "asc" }, // usually SUBMITTED first if we sort alphabetically, but better to order by date
        { updatedAt: "desc" }
      ],
    });

    // Serialize Decimals
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
    console.error("GET Admin Timesheets Error:", error);
    return jsonResponse({ error: "Failed to fetch timesheets" }, 500);
  }
}
