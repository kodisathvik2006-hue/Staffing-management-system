import prisma from "@/lib/prisma";
import { getSession } from "@/lib/jwt";
import { PageHeader } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function VendorProjectsPage() {
  const session = await getSession();
  const vendorId = session?.vendorId;

  if (!vendorId) {
    redirect("/login");
  }

  const projects = await prisma.project.findMany({
    where: {
      OR: [{ upstreamVendorId: vendorId }, { downstreamVendorId: vendorId }],
    },
    include: {
      client: { select: { legalName: true } },
      consultant: { select: { firstName: true, lastName: true } },
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <div>
      <PageHeader title="My Projects" description="View assigned projects" />

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Project Name</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Client</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Consultant</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Start Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No projects found.
                </td>
              </tr>
            ) : (
              projects.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">{p.client.legalName}</td>
                  <td className="px-4 py-3">{p.consultant.firstName} {p.consultant.lastName}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.startDate ? p.startDate.toLocaleDateString() : "N/A"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
