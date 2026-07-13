import Link from "next/link";
import { Badge, EmptyState } from "@/components/ui";
import { Button } from "@/components/forms";

interface EntityRow {
  id: string;
  status: string;
  [key: string]: unknown;
}

interface EntityListTableProps {
  title: string;
  rows: EntityRow[];
  nameKey: string;
  contactKey?: string;
  basePath: string;
  newLabel: string;
}

export function EntityListTable({
  title,
  rows,
  nameKey,
  contactKey,
  basePath,
  newLabel,
}: EntityListTableProps) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div />
        <Link href={`${basePath}/new`}>
          <Button size="sm">{newLabel}</Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <EmptyState message={`No ${title.toLowerCase()} found yet.`} />
      ) : (
        <div className="glass-card overflow-hidden rounded-2xl border border-slate-200/60 bg-white/50 dark:border-dark-border dark:bg-dark-card/50">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200/60 dark:divide-dark-border">
              <thead className="bg-slate-50/50 dark:bg-dark-card/80">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Contact
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                {rows.map((row) => {
                const contact = contactKey
                  ? row[contactKey]
                  : row.personalEmail ??
                    (row.emailAddresses as string[])?.[0] ??
                    row.mobileNumber ??
                    (row.phoneNumbers as string[])?.[0];

                return (
                  <tr key={row.id} className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-dark-border-hover/30">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                          {String(row[nameKey]).charAt(0)}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {String(row[nameKey])}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <Badge
                        variant={
                          row.status === "ACTIVE" ? "success" : "warning"
                        }
                      >
                        {row.status}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {contact ? String(contact) : "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <Link
                        href={`${basePath}/${row.id}/edit`}
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
