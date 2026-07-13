import prisma from "@/lib/prisma";
import { getTenantIdFromSession } from "@/lib/tenant";
import { PageHeader } from "@/components/ui";
import { EntityListTable } from "@/components/entity-list-table";

export default async function VendorsPage() {
  const tenantId = await getTenantIdFromSession();
  const vendors = tenantId
    ? await prisma.vendor.findMany({
        where: { selfEntityId: tenantId },
        orderBy: { legalName: "asc" },
      })
    : [];

  return (
    <div>
      <PageHeader
        title="Vendors"
        description="Manage staffing partner vendors"
      />
      <EntityListTable
        title="Vendors"
        rows={vendors}
        nameKey="legalName"
        basePath="/vendors"
        newLabel="Add Vendor"
      />
    </div>
  );
}
