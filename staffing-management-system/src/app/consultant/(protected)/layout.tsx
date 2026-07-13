import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Clock,
  CreditCard,
  Bell,
  User,
  Settings,
} from "lucide-react";
import { getSession } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import { LogoutButton } from "@/components/logout-button";
import { ThemeProvider } from "@/components/theme-provider";

const navItems = [
  { href: "/consultant/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/consultant/projects", label: "My Projects", icon: "FolderKanban" },
  { href: "/consultant/timesheets", label: "Timesheets", icon: "Clock" },
  { href: "/consultant/documents", label: "Documents", icon: "FileText" },
  { href: "/consultant/payments", label: "Payments", icon: "CreditCard" },
  { href: "/consultant/profile", label: "Profile", icon: "User" },
  { href: "/consultant/settings", label: "Settings", icon: "Settings" },
];

import { DashboardShell } from "@/components/dashboard-shell";

export default async function ConsultantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/consultant/login");

  const consultant = await prisma.consultant.findUnique({
    where: { id: session.sub },
    select: { themePreference: true }
  });
  
  const defaultTheme = consultant?.themePreference || "system";

  return (
    <ThemeProvider defaultTheme={defaultTheme as any}>
      <DashboardShell
        title="Consultant Portal"
        navItems={navItems}
        session={session}
        hideNotifications={true}
      >
        {children}
      </DashboardShell>
    </ThemeProvider>
  );
}
