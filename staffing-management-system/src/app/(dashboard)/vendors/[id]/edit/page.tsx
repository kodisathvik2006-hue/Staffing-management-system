import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getTenantIdFromSession } from "@/lib/tenant";
import { PageHeader } from "@/components/ui";
import { ExternalEntityForm } from "@/components/external-entity-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditVendorPage({ params }: Props) {
  const { id } = await params;
  const tenantId = await getTenantIdFromSession();
  if (!tenantId) notFound();

  const rawVendor = await prisma.vendor.findFirst({
    where: { id, selfEntityId: tenantId },
  });
  if (!rawVendor) notFound();

  const vendor = {
    ...rawVendor,
    email: rawVendor.email ?? undefined,
    firstName: rawVendor.firstName ?? undefined,
    lastName: rawVendor.lastName ?? undefined,
    registeredAddress: rawVendor.registeredAddress ?? undefined,
    communicationAddress: rawVendor.communicationAddress ?? undefined,
  };

  return (
    <div>
      <PageHeader title="Edit Vendor" description={vendor.legalName} />
      <ExternalEntityForm type="vendor" initialData={vendor} />
    </div>
  );
}
