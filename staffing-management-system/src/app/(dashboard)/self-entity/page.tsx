import prisma from "@/lib/prisma";
import { getTenantIdFromSession } from "@/lib/tenant";
import { decrypt, maskSensitive } from "@/lib/encryption";
import { PageHeader, Card, Badge } from "@/components/ui";
import { SelfEntityForm } from "@/components/self-entity-form";

export default async function SelfEntityPage() {
  const tenantId = await getTenantIdFromSession();

  const entity = tenantId
    ? await prisma.selfEntity.findUnique({ where: { id: tenantId } })
    : null;

  return (
    <div>
      <PageHeader
        title="Organization"
        description="Your staffing company profile and banking details"
      />

      {!entity ? (
        <Card>
          <p className="text-sm text-slate-600">
            No organization profile found. Contact your administrator to set up
            your self entity.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Company Details</h2>
              <Badge
                variant={entity.status === "ACTIVE" ? "success" : "warning"}
              >
                {entity.status}
              </Badge>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Company Name</dt>
                <dd className="font-medium">{entity.companyName}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Registered Address</dt>
                <dd>{entity.registeredAddress}</dd>
              </div>
              {entity.communicationAddress && (
                <div>
                  <dt className="text-slate-500">Communication Address</dt>
                  <dd>{entity.communicationAddress}</dd>
                </div>
              )}
              <div>
                <dt className="text-slate-500">Phone Numbers</dt>
                <dd>{entity.phoneNumbers.join(", ")}</dd>
              </div>
              <div>
                <dt className="text-slate-500">EIN</dt>
                <dd className="font-mono">
                  {maskSensitive(decrypt(entity.einNumber))}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h2 className="mb-4 font-semibold text-slate-900">
              Banking Information
            </h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Bank Name</dt>
                <dd className="font-medium">{entity.bankName}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Account Number</dt>
                <dd className="font-mono">
                  {maskSensitive(decrypt(entity.bankAccountNumber))}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Routing Number</dt>
                <dd className="font-mono">
                  {maskSensitive(decrypt(entity.routingNumber))}
                </dd>
              </div>
              {entity.swiftCode && (
                <div>
                  <dt className="text-slate-500">SWIFT Code</dt>
                  <dd>{entity.swiftCode}</dd>
                </div>
              )}
              {entity.iban && (
                <div>
                  <dt className="text-slate-500">IBAN</dt>
                  <dd>{entity.iban}</dd>
                </div>
              )}
            </dl>
          </Card>
        </div>
      )}

      <SelfEntityForm
        initialData={
          entity
            ? {
                companyName: entity.companyName,
                registeredAddress: entity.registeredAddress,
                communicationAddress: entity.communicationAddress ?? undefined,
                phoneNumbers: entity.phoneNumbers,
                bankName: entity.bankName,
                bankAddress: entity.bankAddress ?? undefined,
                swiftCode: entity.swiftCode ?? undefined,
                iban: entity.iban ?? undefined,
              }
            : undefined
        }
      />
    </div>
  );
}
