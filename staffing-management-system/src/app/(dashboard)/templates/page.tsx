import Link from "next/link";
import prisma from "@/lib/prisma";
import { getTenantIdFromSession } from "@/lib/tenant";
import { PageHeader, Card, Badge, EmptyState } from "@/components/ui";
import { Button } from "@/components/forms";
import { TemplateForm } from "@/components/template-form";
import { formatCurrency } from "@/lib/utils";
import { toNumber } from "@/lib/financials";

export default async function TemplatesPage() {
  const tenantId = await getTenantIdFromSession();

  const templates = tenantId
    ? await prisma.projectTemplate.findMany({
        where: { selfEntityId: tenantId, isActive: true },
        include: {
          commissionDefaults: true,
          requiredDocuments: true,
          _count: { select: { projects: true } },
        },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <div>
      <PageHeader
        title="Project Templates"
        description="Reusable project configurations for faster setup"
        action={
          <Link href="/projects/new">
            <Button size="sm" variant="secondary">
              Create Project from Template
            </Button>
          </Link>
        }
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          {templates.length === 0 ? (
            <EmptyState message="No templates yet. Create one to speed up project setup." />
          ) : (
            <div className="space-y-4">
              {templates.map((t) => (
                <Card key={t.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{t.name}</h3>
                      {t.description && (
                        <p className="mt-1 text-sm text-slate-600">
                          {t.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="default">
                      {t._count.projects} project
                      {t._count.projects !== 1 ? "s" : ""}
                    </Badge>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-slate-500">Client Rate</dt>
                      <dd>
                        {t.defaultClientRate
                          ? formatCurrency(toNumber(t.defaultClientRate))
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Pay Rate</dt>
                      <dd>
                        {t.defaultPayRate
                          ? formatCurrency(toNumber(t.defaultPayRate))
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Payment Terms</dt>
                      <dd>{t.paymentTerms ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Schedule</dt>
                      <dd>{t.invoiceSchedule}</dd>
                    </div>
                  </dl>

                  {t.commissionDefaults.length > 0 && (
                    <p className="mt-3 text-xs text-slate-500">
                      Commission:{" "}
                      {t.commissionDefaults
                        .map((c) =>
                          c.percent
                            ? `${toNumber(c.percent)}% markup`
                            : c.type.replace(/_/g, " ")
                        )
                        .join(", ")}
                    </p>
                  )}

                  {t.requiredDocuments.length > 0 && (
                    <p className="mt-1 text-xs text-slate-500">
                      Required docs:{" "}
                      {t.requiredDocuments
                        .map((d) => d.documentType.replace(/_/g, " "))
                        .join(", ")}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        <TemplateForm />
      </div>
    </div>
  );
}
