import Link from "next/link";
import prisma from "@/lib/prisma";
import { getTenantIdFromSession } from "@/lib/tenant";
import { PageHeader, Badge, EmptyState } from "@/components/ui";
import { Button } from "@/components/forms";

export default async function ClientsPage() {
  const tenantId = await getTenantIdFromSession();
  const clients = tenantId
    ? await prisma.client.findMany({
        where: { selfEntityId: tenantId },
        orderBy: { legalName: "asc" },
      })
    : [];

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Manage client companies and billing contacts"
      />
      
      <div className="mb-6 flex items-center justify-between">
        <div />
        <Link href="/clients/new">
          <Button size="sm">Add Client</Button>
        </Link>
      </div>

      {clients.length === 0 ? (
        <EmptyState message="No clients found yet." />
      ) : (
        <div className="glass-card overflow-hidden rounded-2xl border border-slate-200/60 bg-white/50 dark:border-dark-border dark:bg-dark-card/50">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200/60 dark:divide-dark-border">
              <thead className="bg-slate-50/50 dark:bg-dark-card/80">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Legal Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">First Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Last Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Phone</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                {clients.map((client) => {
                  const email = client.emailAddresses[0] || "—";
                  const phone = client.phoneNumbers[0] || "—";
                  return (
                    <tr key={client.id} className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-dark-border-hover/30">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                            {client.legalName.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            {client.legalName}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900 dark:text-white">{client.firstName}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900 dark:text-white">{client.lastName}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Badge variant={client.status === "ACTIVE" ? "success" : "warning"}>
                          {client.status}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{email}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{phone}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <Link
                          href={`/clients/${client.id}/edit`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 bg-brand-50 hover:bg-brand-100 dark:bg-brand-500/10 dark:hover:bg-brand-500/20 px-3 py-1.5 rounded-lg"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
