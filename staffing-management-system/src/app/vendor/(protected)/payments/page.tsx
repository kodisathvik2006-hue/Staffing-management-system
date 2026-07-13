import { getSession } from "@/lib/jwt";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { PageHeader } from "@/components/ui";

export default async function VendorPaymentsPage() {
  const session = await getSession();
  if (!session || !session.roles.some((r) => r.role === "VENDOR")) {
    redirect("/login");
  }

  const invoices = await prisma.vendorInvoice.findMany({
    where: { vendorId: session.vendorId },
    include: {
      project: true,
      timesheet: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Payments" 
        description="View and track your payment status."
      />

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="glass-card overflow-hidden rounded-2xl border border-slate-200/60 bg-white/50 dark:border-dark-border dark:bg-dark-card/50">
              <table className="min-w-full divide-y divide-slate-200/60 dark:divide-dark-border">
                <thead className="bg-slate-50/50 dark:bg-dark-card/80">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Project
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Issue Date
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        No payments found.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv.id} className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-dark-border-hover/30">
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                          {inv.project.name}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                          ${inv.amount.toString()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                          {new Date(inv.issueDate).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            inv.status === "PAID" 
                            ? "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400" 
                            : "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400"
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <a href={`/api/invoices/${inv.id}/pdf`} className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 bg-brand-50 hover:bg-brand-100 dark:bg-brand-500/10 dark:hover:bg-brand-500/20 px-3 py-1.5 rounded-lg">
                            Download
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
