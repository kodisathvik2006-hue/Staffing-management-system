import prisma from "@/lib/prisma";
import { getTenantIdFromSession } from "@/lib/tenant";
import { PageHeader, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default async function AuditPage() {
  const tenantId = await getTenantIdFromSession();

  const logs = tenantId
    ? await prisma.auditLog.findMany({
        where: { selfEntityId: tenantId },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      })
    : [];

  return (
    <div>
      <PageHeader
        title="Audit Log"
        description="Track all system actions for compliance and security"
      />

      {logs.length === 0 ? (
        <EmptyState message="No audit entries yet." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">
                  Time
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">
                  User
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">
                  Action
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">
                  Resource
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {log.user
                      ? `${log.user.firstName} ${log.user.lastName}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 font-medium">{log.action}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {log.resource}
                    {log.resourceId && (
                      <span className="ml-1 text-xs text-slate-400">
                        ({log.resourceId.slice(0, 8)}…)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
