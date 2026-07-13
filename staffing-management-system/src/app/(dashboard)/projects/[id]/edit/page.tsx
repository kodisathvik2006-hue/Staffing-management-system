import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getTenantIdFromSession } from "@/lib/tenant";
import { PageHeader } from "@/components/ui";
import { ProjectForm } from "@/components/project-form";
import { toNumber } from "@/lib/financials";

type Props = { params: Promise<{ id: string }> };

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;
  const tenantId = await getTenantIdFromSession();
  if (!tenantId) notFound();

  const project = await prisma.project.findFirst({
    where: { id, selfEntityId: tenantId },
    include: {
      salespeople: true,
      commissionRules: true,
    },
  });

  if (!project) notFound();

  const [clients, consultants, vendors, templates] =
    await Promise.all([
      prisma.client.findMany({
        where: { selfEntityId: tenantId },
        select: { id: true, legalName: true },
      }),
      prisma.consultant.findMany({
        where: { selfEntityId: tenantId },
        select: { id: true, firstName: true, lastName: true },
      }),
      prisma.vendor.findMany({
        where: { selfEntityId: tenantId },
        select: { id: true, legalName: true },
      }),
      prisma.projectTemplate.findMany({
        where: { selfEntityId: tenantId, isActive: true },
      }),
    ]);

  const initialData = {
    id: project.id,
    name: project.name,
    clientId: project.clientId,
    consultantId: project.consultantId,
    upstreamVendorId: project.upstreamVendorId ?? undefined,
    downstreamVendorId: project.downstreamVendorId ?? undefined,

    clientRatePerHour: toNumber(project.clientRatePerHour),
    payRatePerHour: toNumber(project.payRatePerHour),
    invoiceSchedule: project.invoiceSchedule,
    paymentTerms: project.paymentTerms ?? undefined,
    paymentMode: project.paymentMode,
    invoiceEmail: project.invoiceEmail ?? undefined,
    currency: project.currency,
    startDate: project.startDate ? project.startDate.toISOString().split("T")[0] : "",

  };

  return (
    <div>
      <PageHeader
        title="Edit Project"
        description={`Update details for ${project.name}`}
      />
      <ProjectForm
        clients={clients.map((c) => ({ id: c.id, label: c.legalName }))}
        consultants={consultants.map((c) => ({ id: c.id, label: `${c.firstName} ${c.lastName}` }))}
        vendors={vendors.map((v) => ({ id: v.id, label: v.legalName }))}
        templates={templates.map((t) => ({
          id: t.id,
          name: t.name,
          defaultClientRate: toNumber(t.defaultClientRate),
          defaultPayRate: toNumber(t.defaultPayRate),
          paymentTerms: t.paymentTerms,
          invoiceSchedule: t.invoiceSchedule,
          paymentMode: t.paymentMode,
          currency: t.currency,
        }))}
        initialData={initialData}
      />
    </div>
  );
}
