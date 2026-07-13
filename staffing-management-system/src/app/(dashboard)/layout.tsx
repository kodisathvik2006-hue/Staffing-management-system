import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Building2,
  Users,
  Briefcase,
  FolderKanban,
  FileStack,
  LayoutDashboard,
  Building,
  ScrollText,
} from "lucide-react";
import { getSession } from "@/lib/jwt";
import { LogoutButton } from "@/components/logout-button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/self-entity", label: "Organization", icon: "Building2" },
  { href: "/clients", label: "Clients", icon: "Building" },
  { href: "/vendors", label: "Vendors", icon: "Briefcase" },
  { href: "/consultants", label: "Consultants", icon: "Users" },
  { href: "/salespeople", label: "Salespeople", icon: "Users" },
  { href: "/projects", label: "Projects", icon: "FolderKanban" },
  { href: "/timesheets", label: "Timesheets", icon: "FolderKanban" },
  { href: "/invoices", label: "Invoices", icon: "ScrollText" },
  { href: "/templates", label: "Templates", icon: "FileStack" },
  { href: "/audit", label: "Audit Log", icon: "ScrollText" },
];

import { DashboardShell } from "@/components/dashboard-shell";
import { ThemeProvider } from "@/components/theme-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <ThemeProvider defaultTheme="system">
      <DashboardShell
        title="Admin Portal"
        navItems={navItems}
        session={session}
      >
        {children}
      </DashboardShell>
    </ThemeProvider>
  );
}
