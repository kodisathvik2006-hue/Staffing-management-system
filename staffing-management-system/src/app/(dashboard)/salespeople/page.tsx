import prisma from "@/lib/prisma";
import { getTenantIdFromSession } from "@/lib/tenant";
import { PageHeader } from "@/components/ui";
import { EntityListTable } from "@/components/entity-list-table";

export default async function SalespeoplePage() {
  const tenantId = await getTenantIdFromSession();
  const salespeople = tenantId
    ? await prisma.salesperson.findMany({
        where: { selfEntityId: tenantId },
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      })
    : [];

  return (
    <div>
      <PageHeader
        title="Salespeople"
        description="Manage sales team members and commission earners"
      />
      <EntityListTable
        title="Salespeople"
        rows={salespeople.map(s => {
          const f = s.firstName?.trim() || "";
          const l = s.lastName?.trim() || "";
          const name = (f && l) ? `${f} ${l}` : (f || l || "Unnamed Salesperson");
          return { ...s, displayName: name };
        })}
        nameKey="displayName"
        basePath="/salespeople"
        newLabel="Add Salesperson"
      />
    </div>
  );
}
