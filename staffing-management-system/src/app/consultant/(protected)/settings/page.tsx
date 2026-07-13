import { getSession } from "@/lib/jwt";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import SettingsClient from "./settings-client";

export default async function ConsultantSettings() {
  const session = await getSession();
  if (!session || !session.roles.some((r) => r.role === "CONSULTANT")) {
    redirect("/consultant/login");
  }

  const consultant = await prisma.consultant.findUnique({
    where: { id: session.sub },
    include: {
      sessions: {
        orderBy: { loginTime: "desc" }
      },
      notifications: true,
    }
  });

  if (!consultant) redirect("/consultant/login");

  // Ensure notification preferences exist
  if (!consultant.notifications) {
    const defaultPrefs = await prisma.consultantNotificationPreference.create({
      data: { consultantId: consultant.id }
    });
    consultant.notifications = defaultPrefs;
  }

  return <SettingsClient initialData={consultant} />;
}
