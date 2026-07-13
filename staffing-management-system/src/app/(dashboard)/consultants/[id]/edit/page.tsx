import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getTenantIdFromSession } from "@/lib/tenant";
import { PageHeader } from "@/components/ui";
import { PersonEntityForm } from "@/components/person-entity-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditConsultantPage({ params }: Props) {
  const { id } = await params;
  const tenantId = await getTenantIdFromSession();
  if (!tenantId) notFound();

  const consultant = await prisma.consultant.findFirst({
    where: { id, selfEntityId: tenantId },
  });
  if (!consultant) notFound();

  return (
    <div>
      <PageHeader title="Edit Consultant" description={`${consultant.firstName} ${consultant.lastName}`} />
      <PersonEntityForm
        type="consultant"
        initialData={{
          ...consultant,
          personalEmail: consultant.personalEmail ?? undefined,
          visaStatus: consultant.visaStatus ?? undefined,
          address: consultant.address ?? undefined,
          mobileNumber: consultant.mobileNumber ?? undefined,
        }}
      />
    </div>
  );
}
