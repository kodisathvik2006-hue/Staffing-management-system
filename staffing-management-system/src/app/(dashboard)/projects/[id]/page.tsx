import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getTenantIdFromSession } from "@/lib/tenant";
import { PageHeader, Card, Badge } from "@/components/ui";
import { Button } from "@/components/forms";
import { formatCurrency, formatDate } from "@/lib/utils";
import { calculateProjectFinancials, toNumber } from "@/lib/financials";
import { getAllowedTransitions } from "@/lib/status-transitions";
import { ProjectStatusActions } from "@/components/project-status-actions";
import { ProjectDocuments } from "@/components/project-documents";
import { getDownloadUrl } from "@/lib/s3";

type Props = { params: Promise<{ id: string }> };

const statusVariant: Record<
  string,
  "default" | "success" | "warning" | "danger"
> = {
  DRAFT: "default",
  ACTIVE: "success",
  PAUSED: "warning",
  TERMINATED: "danger",
  COMPLETED: "success",
  ARCHIVED: "default",
};

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const tenantId = await getTenantIdFromSession();
  if (!tenantId) notFound();

  const project = await prisma.project.findFirst({
    where: { id, selfEntityId: tenantId },
    include: {
      client: true,
      consultant: true,
      upstreamVendor: true,
      downstreamVendor: true,
      template: true,
      salespeople: { include: { salesperson: true } },
      commissionRules: {
        include: { salesperson: { select: { firstName: true, lastName: true } } },
      },
      documents: {
        include: {
          versions: {
            orderBy: { version: "desc" },
            include: {
              uploadedBy: { select: { firstName: true, lastName: true } },
            },
          },
        },
      },
      statusHistory: {
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  if (!project) notFound();

  const financials = calculateProjectFinancials({
    clientRatePerHour: toNumber(project.clientRatePerHour),
    payRatePerHour: toNumber(project.payRatePerHour),
    hoursWorked: 0,
    commissionRules: project.commissionRules.map((r) => ({
      type: r.type,
      currency: r.currency,
      amount: toNumber(r.amount),
      percent: toNumber(r.percent),
    })),
  });

  const documentsWithUrls = await Promise.all(
    project.documents.map(async (doc) => ({
      ...doc,
      versions: await Promise.all(
        doc.versions.map(async (v) => ({
          ...v,
          createdAt: v.createdAt.toISOString(),
          downloadUrl: await getDownloadUrl(v.s3Key),
        }))
      ),
    }))
  );

  const allowedTransitions = getAllowedTransitions(project.status);

  return (
    <div>
      <PageHeader
        title={project.name}
        description={`${project.client.legalName} - ${project.consultant.firstName} ${project.consultant.lastName}`}
        action={
          <Link href="/projects">
            <Button variant="secondary" size="sm">
              Back to Projects
            </Button>
          </Link>
        }
      />

      <div className="mb-6 flex items-center gap-3">
        <Badge variant={statusVariant[project.status] ?? "default"}>
          {project.status}
        </Badge>
        {project.template && (
          <span className="text-sm text-slate-500">
            Template: {project.template.name}
          </span>
        )}
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Client Rate/hr</p>
          <p className="text-2xl font-bold">
            {formatCurrency(toNumber(project.clientRatePerHour), project.currency)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Pay Rate/hr</p>
          <p className="text-2xl font-bold">
            {formatCurrency(toNumber(project.payRatePerHour), project.currency)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Markup/hr</p>
          <p className="text-2xl font-bold text-green-700">
            {formatCurrency(financials.markupPerHour, project.currency)}
          </p>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold text-slate-900">Project Details</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Invoice Schedule</dt>
              <dd>{project.invoiceSchedule}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Payment Terms</dt>
              <dd>{project.paymentTerms ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Payment Mode</dt>
              <dd>{project.paymentMode}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Start Date</dt>
              <dd>
                {project.startDate ? formatDate(project.startDate) : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Invoice Email</dt>
              <dd>{project.invoiceEmail ?? "—"}</dd>
            </div>
            {project.upstreamVendor && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Upstream Vendor</dt>
                <dd>{project.upstreamVendor.legalName}</dd>
              </div>
            )}
            {project.downstreamVendor && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Downstream Vendor</dt>
                <dd>{project.downstreamVendor.legalName}</dd>
              </div>
            )}
          </dl>

          <h3 className="mb-2 mt-6 font-medium text-slate-900">Salespeople</h3>
          <ul className="text-sm text-slate-600">
            {project.salespeople.map((sp) => (
              <li key={sp.id}>{sp.salesperson.firstName} {sp.salesperson.lastName}</li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold text-slate-900">
            Commission Rules
          </h2>
          {project.commissionRules.length === 0 ? (
            <p className="text-sm text-slate-500">No commission rules.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {project.commissionRules.map((rule) => (
                <li
                  key={rule.id}
                  className="rounded-lg border border-slate-100 p-3"
                >
                  <p className="font-medium">{rule.salesperson.firstName} {rule.salesperson.lastName}</p>
                  <p className="text-slate-600">
                    {rule.type.replace(/_/g, " ")}
                    {rule.percent != null && ` — ${toNumber(rule.percent)}%`}
                    {rule.amount != null &&
                      ` — ${formatCurrency(toNumber(rule.amount), rule.currency)}`}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <h2 className="mb-4 font-semibold text-slate-900">Status Workflow</h2>
          <ProjectStatusActions
            projectId={project.id}
            currentStatus={project.status}
            allowedTransitions={allowedTransitions}
          />
          {project.statusHistory.length > 0 && (
            <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
              {project.statusHistory.map((h) => (
                <li key={h.id} className="text-slate-600">
                  {h.fromStatus ? `${h.fromStatus} → ` : ""}
                  <strong>{h.toStatus}</strong> by {h.user.firstName}{" "}
                  {h.user.lastName} · {formatDate(h.createdAt)}
                  {h.reason && ` — ${h.reason}`}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Documents
        </h2>
        <ProjectDocuments
          projectId={project.id}
          documents={documentsWithUrls}
        />
      </div>
    </div>
  );
}
