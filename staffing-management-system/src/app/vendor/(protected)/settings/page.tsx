import { getSession } from "@/lib/jwt";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { VendorSettingsForm } from "./settings-form";

export default async function VendorSettingsPage() {
  const session = await getSession();
  if (!session || !session.roles.some((r) => r.role === "VENDOR")) {
    redirect("/login");
  }

  const vendor = await prisma.vendor.findUnique({
    where: { id: session.vendorId },
    select: {
      legalName: true,
      email: true,
      mobile: true,
      website: true,
      taxId: true,
      registeredAddress: true,
    }
  });

  if (!vendor) {
    return <div>Vendor profile not found</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader 
        title="Company Profile & Settings" 
        description="Manage your vendor account preferences, contact details, and address."
      />
      
      <div className="glass-card rounded-2xl border border-slate-200/60 bg-white/50 p-6 sm:p-8 dark:border-dark-border dark:bg-dark-card/50 shadow-sm">
        <VendorSettingsForm vendor={vendor} />
      </div>
    </div>
  );
}
