import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getTenantIdFromSession } from "@/lib/tenant";
import { PageHeader } from "@/components/ui";
import { PersonEntityForm } from "@/components/person-entity-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditSalespersonPage({ params }: Props) {
  const { id } = await params;
  const tenantId = await getTenantIdFromSession();
  if (!tenantId) notFound();

  const salesperson = await prisma.salesperson.findFirst({
    where: { id, selfEntityId: tenantId },
  });
  if (!salesperson) notFound();

  return (
    <div>
      <PageHeader title="Edit Salesperson" description={`${salesperson.firstName} ${salesperson.lastName}`} />
      <PersonEntityForm
        type="salesperson"
        initialData={{
          ...salesperson,
          personalEmail: salesperson.personalEmail ?? undefined,
          visaStatus: salesperson.visaStatus ?? undefined,
          address: salesperson.address ?? undefined,
          mobileNumber: salesperson.mobileNumber ?? undefined,
        }}
      />
    </div>
  );
}
