import { getSession } from "@/lib/jwt";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  FolderKanban,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle
} from "lucide-react";

async function getDashboardData(consultantId: string) {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [activeProjects, recentTimesheets, recentDocuments, pendingCount, approvedCount, rejectedCount, submittedThisMonth] = await Promise.all([
    prisma.project.count({
      where: { consultantId, status: "ACTIVE" },
    }),
    prisma.timesheet.findMany({
      where: { consultantId },
      orderBy: { weekEndingDate: "desc" },
      take: 5,
    }),
    prisma.consultantDocument.findMany({
      where: { consultantId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.timesheet.count({
      where: { consultantId, status: "Pending Approval" }
    }),
    prisma.timesheet.count({
      where: { consultantId, status: "Approved" }
    }),
    prisma.timesheet.count({
      where: { consultantId, status: "Rejected" }
    }),
    prisma.timesheet.count({
      where: { 
        consultantId, 
        submittedDate: { gte: firstDayOfMonth }
      }
    })
  ]);

  return { activeProjects, recentTimesheets, recentDocuments, pendingCount, approvedCount, rejectedCount, submittedThisMonth };
}

export default async function ConsultantDashboard() {
  const session = await getSession();
  if (!session || !session.roles.some((r) => r.role === "CONSULTANT")) {
    redirect("/consultant/login");
  }

  const data = await getDashboardData(session.sub);

  const stats = [
    { name: "Pending Approval", value: data.pendingCount, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
    { name: "Approved", value: data.approvedCount, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
    { name: "Rejected", value: data.rejectedCount, icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" },
    { name: "Submitted This Month", value: data.submittedThisMonth, icon: FileText, color: "text-blue-600", bg: "bg-blue-100" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Timesheet Status</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="overflow-hidden rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-sm transition-colors duration-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">{stat.name}</dt>
                    <dd>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-sm transition-colors duration-200">
          <div className="border-b border-slate-200 dark:border-dark-border px-6 py-4">
            <h3 className="text-base font-semibold leading-6 text-slate-900 dark:text-white">Recent Timesheets</h3>
          </div>
          <div className="p-6">
            {data.recentTimesheets.length > 0 ? (
              <ul className="divide-y divide-slate-200 dark:divide-dark-border">
                {data.recentTimesheets.map((ts) => (
                  <li key={ts.id} className="py-3 flex justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-300">Week Ending {ts.weekEndingDate.toLocaleDateString()}</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{ts.hoursWorked.toString()} hrs ({ts.status})</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No recent timesheets.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
