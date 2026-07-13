import prisma from "@/lib/prisma";
import { getSession } from "@/lib/jwt";
import { PageHeader, StatCard } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { calculateProjectFinancials, toNumber } from "@/lib/financials";

export default async function DashboardPage() {
  const session = await getSession();
  const tenantId = session?.roles[0]?.selfEntityId;

  const [projectCount, consultantCount, vendorCount, projects] =
    await Promise.all([
      tenantId
        ? prisma.project.count({ where: { selfEntityId: tenantId } })
        : 0,
      tenantId
        ? prisma.consultant.count({ where: { selfEntityId: tenantId } })
        : 0,
      tenantId
        ? prisma.vendor.count({ where: { selfEntityId: tenantId } })
        : 0,
      tenantId
        ? prisma.project.findMany({
            where: { selfEntityId: tenantId, status: "ACTIVE" },
            include: { commissionRules: true },
            take: 5,
          })
        : [],
    ]);

  const activeMarkup = projects.reduce((sum, p) => {
    const f = calculateProjectFinancials({
      clientRatePerHour: toNumber(p.clientRatePerHour),
      payRatePerHour: toNumber(p.payRatePerHour),
      hoursWorked: 0,
      commissionRules: p.commissionRules.map((r) => ({
        type: r.type,
        currency: r.currency,
        amount: toNumber(r.amount),
        percent: toNumber(r.percent),
      })),
    });
    return sum + f.markupPerHour;
  }, 0);

  return (
    <div>
      <PageHeader
        title={`Welcome, ${session?.firstName}`}
        description="Overview of your staffing operations"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Projects" value={String(projects.length)} />
        <StatCard label="Total Projects" value={String(projectCount)} />
        <StatCard label="Consultants" value={String(consultantCount)} />
        <StatCard label="Vendors" value={String(vendorCount)} />
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Active Project Markup (per hour)
        </h2>
        {projects.length === 0 ? (
          <p className="text-sm text-slate-500">No active projects yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Project
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Client Rate
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Pay Rate
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Markup/hr
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {projects.map((p) => {
                  const financials = calculateProjectFinancials({
                    clientRatePerHour: toNumber(p.clientRatePerHour),
                    payRatePerHour: toNumber(p.payRatePerHour),
                    hoursWorked: 0,
                    commissionRules: p.commissionRules.map((r) => ({
                      type: r.type,
                      currency: r.currency,
                      amount: toNumber(r.amount),
                      percent: toNumber(r.percent),
                    })),
                  });
                  return (
                    <tr key={p.id}>
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3">
                        {formatCurrency(toNumber(p.clientRatePerHour))}
                      </td>
                      <td className="px-4 py-3">
                        {formatCurrency(toNumber(p.payRatePerHour))}
                      </td>
                      <td className="px-4 py-3 text-green-700">
                        {formatCurrency(financials.markupPerHour)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {projects.length > 0 && (
          <p className="mt-2 text-xs text-slate-500">
            Combined active markup: {formatCurrency(activeMarkup)}/hr across{" "}
            {projects.length} projects
          </p>
        )}
      </div>
    </div>
  );
}
