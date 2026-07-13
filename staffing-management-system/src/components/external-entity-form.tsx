"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, FormError, Input, Textarea } from "@/components/forms";

interface ExternalEntityFormProps {
  type: "vendor" | "client";
  initialData?: {
    id?: string;
    legalName?: string;
    firstName?: string;
    lastName?: string;
    registeredAddress?: string;
    communicationAddress?: string;
    contactNames?: string[];
    emailAddresses?: string[];
    phoneNumbers?: string[];
  };
}

export function ExternalEntityForm({ type, initialData }: ExternalEntityFormProps) {
  const router = useRouter();
  const isEdit = !!initialData?.id;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [legalName, setLegalName] = useState(initialData?.legalName ?? "");
  const [firstName, setFirstName] = useState(initialData?.firstName ?? "");
  const [lastName, setLastName] = useState(initialData?.lastName ?? "");
  const [registeredAddress, setRegisteredAddress] = useState(
    initialData?.registeredAddress ?? ""
  );
  const [communicationAddress, setCommunicationAddress] = useState(
    initialData?.communicationAddress ?? ""
  );
  const [contactNames, setContactNames] = useState(
    initialData?.contactNames?.join(", ") ?? ""
  );
  const [emailAddresses, setEmailAddresses] = useState(
    initialData?.emailAddresses?.join(", ") ?? ""
  );
  const [phoneNumbers, setPhoneNumbers] = useState(
    initialData?.phoneNumbers?.join(", ") ?? ""
  );

  const label = type === "vendor" ? "Vendor" : "Client";
  const apiPath = type === "vendor" ? "/api/vendors" : "/api/clients";
  const listPath = type === "vendor" ? "/vendors" : "/clients";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      legalName,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      registeredAddress: registeredAddress || undefined,
      communicationAddress: communicationAddress || undefined,
      contactNames: contactNames
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      emailAddresses: emailAddresses
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      phoneNumbers: phoneNumbers
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
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
        label="Legal Name *"
        value={legalName}
        onChange={(e) => setLegalName(e.target.value)}
        required
      />
      {type !== "client" && (
        <>
          <Input
            label="First Name *"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required={false}
          />
          <Input
            label="Last Name *"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required={false}
          />
        </>
      )}
      <Textarea
        label="Registered Address"
        value={registeredAddress}
        onChange={(e) => setRegisteredAddress(e.target.value)}
        rows={2}
      />
      <Textarea
        label="Communication Address"
        value={communicationAddress}
        onChange={(e) => setCommunicationAddress(e.target.value)}
        rows={2}
      />
      <Input
        label="Contact Names (comma-separated)"
        value={contactNames}
        onChange={(e) => setContactNames(e.target.value)}
        placeholder="Jane Doe, John Smith"
      />
      <Input
        label="Email Addresses (comma-separated)"
        type="text"
        value={emailAddresses}
        onChange={(e) => setEmailAddresses(e.target.value)}
        placeholder="billing@company.com"
      />
      <Input
        label="Phone Numbers (comma-separated)"
        value={phoneNumbers}
        onChange={(e) => setPhoneNumbers(e.target.value)}
        placeholder="+1-555-0100"
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
