import { PageHeader } from "@/components/ui";
import { AdminProvisionVendorForm } from "./admin-provision-vendor-form";

export default function NewVendorPage() {
  return (
    <div>
      <PageHeader title="Add Vendor" description="Securely provision a new vendor account" />
      <AdminProvisionVendorForm />
    </div>
  );
}
