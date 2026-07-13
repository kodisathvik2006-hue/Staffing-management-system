import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  FileText,
  CreditCard,
  Building,
  Settings,
} from "lucide-react";
import { getSession } from "@/lib/jwt";
import { LogoutButton } from "@/components/logout-button";

const navItems = [
  { href: "/vendor/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/vendor/projects", label: "My Projects", icon: "FolderKanban" },
  { href: "/vendor/consultants", label: "My Consultants", icon: "Users" },
  { href: "/vendor/payments", label: "Payments", icon: "CreditCard" },
  { href: "/vendor/profile", label: "Profile", icon: "Building" },
  { href: "/vendor/settings", label: "Settings", icon: "Settings" },
];

import { DashboardShell } from "@/components/dashboard-shell";
import { ThemeProvider } from "@/components/theme-provider";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <ThemeProvider defaultTheme="system">
      <DashboardShell
        title="Vendor Portal"
        navItems={navItems}
        session={session}
      >
        {children}
      </DashboardShell>
    </ThemeProvider>
  );
}
