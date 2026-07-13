"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, FormError, Input, Textarea } from "@/components/forms";

interface SelfEntityFormProps {
  initialData?: {
    companyName?: string;
    registeredAddress?: string;
    communicationAddress?: string;
    phoneNumbers?: string[];
    bankName?: string;
    bankAddress?: string;
    swiftCode?: string;
    iban?: string;
  };
}

export function SelfEntityForm({ initialData }: SelfEntityFormProps) {
  const router = useRouter();
  const isEdit = !!initialData?.companyName;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [companyName, setCompanyName] = useState(
    initialData?.companyName ?? ""
  );
  const [registeredAddress, setRegisteredAddress] = useState(
    initialData?.registeredAddress ?? ""
  );
  const [communicationAddress, setCommunicationAddress] = useState(
    initialData?.communicationAddress ?? ""
  );
  const [phoneNumbers, setPhoneNumbers] = useState(
    initialData?.phoneNumbers?.join(", ") ?? ""
  );
  const [einNumber, setEinNumber] = useState("");
  const [bankName, setBankName] = useState(initialData?.bankName ?? "");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [bankAddress, setBankAddress] = useState(
    initialData?.bankAddress ?? ""
  );
  const [swiftCode, setSwiftCode] = useState(initialData?.swiftCode ?? "");
  const [iban, setIban] = useState(initialData?.iban ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload: Record<string, unknown> = {
      companyName,
      registeredAddress,
      communicationAddress: communicationAddress || undefined,
      phoneNumbers: phoneNumbers
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      bankName,
      bankAddress: bankAddress || undefined,
      swiftCode: swiftCode || undefined,
      iban: iban || undefined,
    };

    if (einNumber) payload.einNumber = einNumber;
    if (bankAccountNumber) payload.bankAccountNumber = bankAccountNumber;
    if (routingNumber) payload.routingNumber = routingNumber;

    try {
      const res = await fetch("/api/self-entities", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Save failed");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900">
        {isEdit ? "Edit Organization" : "Create Organization"}
      </h2>
      <FormError message={error} />

      <Input
        label="Company Name *"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        required
      />
      <Textarea
        label="Registered Address *"
        value={registeredAddress}
        onChange={(e) => setRegisteredAddress(e.target.value)}
        required
        rows={2}
      />
      <Textarea
        label="Communication Address"
        value={communicationAddress}
        onChange={(e) => setCommunicationAddress(e.target.value)}
        rows={2}
      />
      <Input
        label="Phone Numbers (comma-separated) *"
        value={phoneNumbers}
        onChange={(e) => setPhoneNumbers(e.target.value)}
        required
      />
      <Input
        label={isEdit ? "EIN (leave blank to keep current)" : "EIN *"}
        value={einNumber}
        onChange={(e) => setEinNumber(e.target.value)}
        required={!isEdit}
      />

      <h3 className="pt-2 font-medium text-slate-900">Banking</h3>
      <Input
        label="Bank Name *"
        value={bankName}
        onChange={(e) => setBankName(e.target.value)}
        required
      />
      <Input
        label={
          isEdit
            ? "Account Number (leave blank to keep)"
            : "Account Number *"
        }
        value={bankAccountNumber}
        onChange={(e) => setBankAccountNumber(e.target.value)}
        required={!isEdit}
      />
      <Input
        label={
          isEdit ? "Routing Number (leave blank to keep)" : "Routing Number *"
        }
        value={routingNumber}
        onChange={(e) => setRoutingNumber(e.target.value)}
        required={!isEdit}
      />
      <Input
        label="Bank Address"
        value={bankAddress}
        onChange={(e) => setBankAddress(e.target.value)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="SWIFT Code"
          value={swiftCode}
          onChange={(e) => setSwiftCode(e.target.value)}
        />
        <Input
          label="IBAN"
          value={iban}
          onChange={(e) => setIban(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : isEdit ? "Update" : "Create"}
      </Button>
    </form>
  );
}
