"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, FormError, Input, Textarea } from "@/components/forms";

interface PersonEntityFormProps {
  type: "consultant" | "salesperson";
  initialData?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    visaStatus?: string;
    address?: string;
    personalEmail?: string;
    mobileNumber?: string;
  };
}

export function PersonEntityForm({ type, initialData }: PersonEntityFormProps) {
  const router = useRouter();
  const isEdit = !!initialData?.id;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState(initialData?.firstName ?? "");
  const [lastName, setLastName] = useState(initialData?.lastName ?? "");
  const [visaStatus, setVisaStatus] = useState(initialData?.visaStatus ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [personalEmail, setPersonalEmail] = useState(
    initialData?.personalEmail ?? ""
  );
  const [mobileNumber, setMobileNumber] = useState(
    initialData?.mobileNumber ?? ""
  );

  const label = type === "consultant" ? "Consultant" : "Salesperson";
  const apiPath =
    type === "consultant" ? "/api/consultants" : "/api/salespeople";
  const listPath = type === "consultant" ? "/consultants" : "/salespeople";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      firstName,
      lastName,
      visaStatus: visaStatus || undefined,
      address: address || undefined,
      personalEmail: personalEmail || undefined,
      mobileNumber: mobileNumber || undefined,
    };

    try {
      const url = isEdit ? `${apiPath}/${initialData!.id}` : apiPath;
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Save failed");
        return;
      }
      router.push(listPath);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900">
        {isEdit ? `Edit ${label}` : `New ${label}`}
      </h2>

      <FormError message={error} />

      <Input
        label="First Name *"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
      />
      <Input
        label="Last Name *"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        required
      />
      {type === "consultant" && (
        <Input
          label="Visa Status"
          value={visaStatus}
          onChange={(e) => setVisaStatus(e.target.value)}
          placeholder="H1B, GC, USC"
        />
      )}
      <Textarea
        label="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        rows={2}
      />
      <Input
        label="Email"
        type="email"
        value={personalEmail}
        onChange={(e) => setPersonalEmail(e.target.value)}
      />
      <Input
        label="Mobile Number"
        value={mobileNumber}
        onChange={(e) => setMobileNumber(e.target.value)}
      />

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Update" : "Create"}
        </Button>
        <Link href={listPath}>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}
