import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getTenantIdFromSession } from "@/lib/tenant";
import { PageHeader } from "@/components/ui";
import { ExternalEntityForm } from "@/components/external-entity-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditClientPage({ params }: Props) {
  const { id } = await params;
  const tenantId = await getTenantIdFromSession();
  if (!tenantId) notFound();

  const rawClient = await prisma.client.findFirst({
    where: { id, selfEntityId: tenantId },
  });
  if (!rawClient) notFound();

  const client = {
    ...rawClient,
    registeredAddress: rawClient.registeredAddress ?? undefined,
    communicationAddress: rawClient.communicationAddress ?? undefined,
  };

  return (
    <div>
      <PageHeader title="Edit Client" description={client.legalName} />
      <ExternalEntityForm type="client" initialData={client} />
    </div>
  );
}
