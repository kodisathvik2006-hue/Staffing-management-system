import prisma from "@/lib/prisma";
import { getTenantIdFromSession } from "@/lib/tenant";
import { PageHeader } from "@/components/ui";
import { EntityListTable } from "@/components/entity-list-table";

export default async function ConsultantsPage() {
  const tenantId = await getTenantIdFromSession();
  const consultants = tenantId
    ? await prisma.consultant.findMany({
        where: { selfEntityId: tenantId },
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      })
    : [];

  return (
    <div>
      <PageHeader
        title="Consultants"
        description="Manage consultants placed on projects"
      />
      <EntityListTable
        title="Consultants"
        rows={consultants.map(c => {
          const f = c.firstName?.trim() || "";
          const l = c.lastName?.trim() || "";
          const name = (f && l) ? `${f} ${l}` : (f || l || "Unnamed Consultant");
          return { ...c, displayName: name };
        })}
        nameKey="displayName"
        basePath="/consultants"
        newLabel="Add Consultant"
      />
    </div>
  );
}
