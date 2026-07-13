import { Suspense } from "react";
import ConsultantLoginForm from "./login-form";

export default function ConsultantLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <ConsultantLoginForm />
    </Suspense>
  );
}
