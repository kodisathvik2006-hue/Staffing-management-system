import { getSession } from "@/lib/jwt";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ConsultantTimesheetsClient from "@/components/timesheets/ConsultantTimesheetsClient";

export default async function ConsultantTimesheets() {
  const session = await getSession();
  if (!session || !session.roles.some((r) => r.role === "CONSULTANT")) {
    redirect("/consultant/login");
  }

  // Fetch projects assigned to this consultant to pass to the client component
  const projects = await prisma.project.findMany({
    where: { consultantId: session.sub, status: "ACTIVE" },
    select: { id: true, name: true }
  });

  return (
    <ConsultantTimesheetsClient projects={projects} />
  );
}
