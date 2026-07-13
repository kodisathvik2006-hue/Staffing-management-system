import prisma from "@/lib/prisma";
import { getSession } from "@/lib/jwt";
import { PageHeader, StatCard } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function VendorDashboardPage() {
  const session = await getSession();
  const vendorId = session?.vendorId;

  if (!vendorId) {
    redirect("/login");
  }

  const [totalProjects, activeProjects] = await Promise.all([
    prisma.project.count({
      where: {
        OR: [{ upstreamVendorId: vendorId }, { downstreamVendorId: vendorId }],
      },
    }),
    prisma.project.count({
      where: {
        status: "ACTIVE",
        OR: [{ upstreamVendorId: vendorId }, { downstreamVendorId: vendorId }],
      },
    }),
  ]);

  const pendingDocsCount = await prisma.projectDocument.count({
    where: {
      project: {
        OR: [{ upstreamVendorId: vendorId }, { downstreamVendorId: vendorId }],
      },
      isRequired: true,
      versions: { none: {} },
    },
  });

  return (
    <div>
      <PageHeader
        title={`Welcome, ${session.firstName}`}
        description="Vendor Portal Overview"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Projects" value={String(totalProjects)} />
        <StatCard label="Active Projects" value={String(activeProjects)} />
        <StatCard
          label="Pending Documents"
          value={String(pendingDocsCount)}
        />
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Recent Activities
        </h2>
        <p className="text-sm text-slate-500">
          More detailed activity feed coming soon.
        </p>
      </div>
    </div>
  );
}
