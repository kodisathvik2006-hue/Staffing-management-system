import { PageHeader } from "@/components/ui";
import { ExternalEntityForm } from "@/components/external-entity-form";

export default function NewClientPage() {
  return (
    <div>
      <PageHeader title="Add Client" description="Create a new client record" />
      <ExternalEntityForm type="client" />
    </div>
  );
}
