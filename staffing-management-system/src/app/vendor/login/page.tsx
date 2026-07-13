import { Suspense } from "react";
import VendorLoginForm from "./login-form";

export default function VendorLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <VendorLoginForm />
    </Suspense>
  );
}
