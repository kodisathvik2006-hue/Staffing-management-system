import Link from "next/link";
import prisma from "@/lib/prisma";
import { getTenantIdFromSession } from "@/lib/tenant";
import { PageHeader, Badge, EmptyState } from "@/components/ui";
import { Button } from "@/components/forms";
import { formatCurrency } from "@/lib/utils";
import { calculateProjectFinancials, toNumber } from "@/lib/financials";

const statusVariant: Record<
  string,
  "default" | "success" | "warning" | "danger"
> = {
  DRAFT: "default",
  ACTIVE: "success",
  PAUSED: "warning",
  TERMINATED: "danger",
  COMPLETED: "success",
  ARCHIVED: "default",
};

export default async function ProjectsPage() {
  const tenantId = await getTenantIdFromSession();

  const projects = tenantId
    ? await prisma.project.findMany({
        where: { selfEntityId: tenantId },
        include: {
          client: { select: { legalName: true } },
          consultant: { select: { firstName: true, lastName: true } },
          commissionRules: true,
        },
        orderBy: { updatedAt: "desc" },
      })
    : [];

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Central hub for staffing agreements and financial terms"
        action={
          <Link href="/projects/new">
            <Button size="sm">New Project</Button>
          </Link>
        }
      />

      {projects.length === 0 ? (
        <EmptyState message="No projects found yet." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">
                  Project
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">
                  Client
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">
                  Consultant
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">
                  Status
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
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/projects/${p.id}`}
                        className="font-medium text-brand-600 hover:underline"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{p.client.legalName}</td>
                    <td className="px-4 py-3">{p.consultant.firstName} {p.consultant.lastName}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[p.status] ?? "default"}>
                        {p.status}
                      </Badge>
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
    </div>
  );
}
