import { PageHeader } from "@/components/ui";
import { AdminProvisionConsultantForm } from "./admin-provision-consultant-form";

export default function NewConsultantPage() {
  return (
    <div>
      <PageHeader
        title="Add Consultant"
        description="Securely provision a new consultant account"
      />
      <AdminProvisionConsultantForm />
    </div>
  );
}
