import prisma from "@/lib/prisma";
import { getTenantIdFromSession } from "@/lib/tenant";
import { PageHeader } from "@/components/ui";
import { ProjectForm } from "@/components/project-form";
import { toNumber } from "@/lib/financials";

export default async function NewProjectPage() {
  const tenantId = await getTenantIdFromSession();
  if (!tenantId) return null;

    const [clients, consultants, vendors, templates, salespeople] =
      await Promise.all([
        prisma.client.findMany({
          where: { selfEntityId: tenantId, status: "ACTIVE" },
          select: { id: true, legalName: true },
        }),
        prisma.consultant.findMany({
          where: { selfEntityId: tenantId, status: "ACTIVE" },
          select: { id: true, firstName: true, lastName: true },
        }),
        prisma.vendor.findMany({
          where: { selfEntityId: tenantId, status: "ACTIVE" },
          select: { id: true, legalName: true },
        }),
        prisma.projectTemplate.findMany({
          where: { selfEntityId: tenantId, isActive: true },
        }),
        prisma.salesperson.findMany({
          where: { selfEntityId: tenantId, status: "ACTIVE" },
          select: { id: true, firstName: true, lastName: true, personalEmail: true },
        }),
      ]);

  return (
    <div>
      <PageHeader
        title="New Project"
        description="Create a staffing project with rates, commissions, and documents"
      />
      <ProjectForm
        clients={clients.map((c) => ({ id: c.id, label: c.legalName }))}
        consultants={consultants.map((c) => ({
          id: c.id,
          label: `${c.firstName} ${c.lastName}`,
        }))}
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
        salespeople={salespeople.map((s) => ({
          id: s.id,
          label: `${s.firstName} ${s.lastName}`.trim() || s.personalEmail || "Unknown Salesperson",
        }))}
      />
    </div>
  );
}
