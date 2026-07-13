import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/jwt";
import { jsonResponse } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.roles.some((r) => r.role === "CONSULTANT")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const { type, data } = await request.json();

    if (!type || !data) {
      return jsonResponse({ error: "Invalid payload" }, 400);
    }

    if (type === "notifications") {
      await prisma.consultantNotificationPreference.upsert({
        where: { consultantId: session.sub },
        update: {
          email: data.email,
          sms: data.sms,
          projectUpdates: data.projectUpdates,
          documentExpiry: data.documentExpiry,
          interviewAlerts: data.interviewAlerts,
          timesheetReminders: data.timesheetReminders,
          paymentAlerts: data.paymentAlerts,
          marketing: data.marketing,
        },
        create: {
          consultantId: session.sub,
          ...data,
        },
      });
      return jsonResponse({ success: true, message: "Notifications updated" }, 200);
    }

    if (type === "preferences") {
      await prisma.consultant.update({
        where: { id: session.sub },
        data: {
          language: data.language,
          timezone: data.timezone,
          themePreference: data.themePreference,
        },
      });
      return jsonResponse({ success: true, message: "Preferences updated" }, 200);
    }

    if (type === "2fa") {
      await prisma.consultant.update({
        where: { id: session.sub },
        data: {
          twoFactorEnabled: data.twoFactorEnabled,
        },
      });
      return jsonResponse({ success: true, message: "2FA settings updated" }, 200);
    }

    return jsonResponse({ error: "Invalid type" }, 400);
  } catch (error: any) {
    console.error("Settings update error:", error);
    return jsonResponse({ error: "An error occurred during update" }, 500);
  }
}
