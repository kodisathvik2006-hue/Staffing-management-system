import { PageHeader } from "@/components/ui";
import { PersonEntityForm } from "@/components/person-entity-form";

export default function NewSalespersonPage() {
  return (
    <div>
      <PageHeader
        title="Add Salesperson"
        description="Create a new salesperson record"
      />
      <PersonEntityForm type="salesperson" />
    </div>
  );
}
