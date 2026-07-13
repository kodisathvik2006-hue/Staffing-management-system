"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, FormError, Input, Select } from "@/components/forms";

export function TemplateForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [invoiceSchedule, setInvoiceSchedule] = useState("MONTHLY");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [paymentMode, setPaymentMode] = useState("ACH");
  const [defaultClientRate, setDefaultClientRate] = useState("");
  const [defaultPayRate, setDefaultPayRate] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [markupTarget, setMarkupTarget] = useState("");
  const [commissionPercent, setCommissionPercent] = useState("10");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      name,
      description: description || undefined,
      invoiceSchedule,
      paymentTerms: paymentTerms || undefined,
      paymentMode,
      defaultClientRate: defaultClientRate
        ? parseFloat(defaultClientRate)
        : undefined,
      defaultPayRate: defaultPayRate ? parseFloat(defaultPayRate) : undefined,
      currency,
      markupTarget: markupTarget ? parseFloat(markupTarget) : undefined,
      commissionDefaults: commissionPercent
        ? [
            {
              type: "PERCENT_MARKUP" as const,
              currency: currency as "USD" | "INR",
              percent: parseFloat(commissionPercent),
            },
          ]
        : [],
      requiredDocuments: [
        "CLIENT_MSA",
        "CLIENT_SOW",
        "CONSULTANT_NDA",
      ],
    };

    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create template");
        return;
      }
      router.refresh();
      setName("");
      setDescription("");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900">Create Template</h2>
      <FormError message={error} />

      <Input
        label="Template Name *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Default Client Rate/hr"
          type="number"
          step="0.01"
          value={defaultClientRate}
          onChange={(e) => setDefaultClientRate(e.target.value)}
        />
        <Input
          label="Default Pay Rate/hr"
          type="number"
          step="0.01"
          value={defaultPayRate}
          onChange={(e) => setDefaultPayRate(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Select
          label="Invoice Schedule"
          value={invoiceSchedule}
          onChange={(e) => setInvoiceSchedule(e.target.value)}
          options={[
            { value: "WEEKLY", label: "Weekly" },
            { value: "BIWEEKLY", label: "Biweekly" },
            { value: "MONTHLY", label: "Monthly" },
            { value: "CUSTOM", label: "Custom" },
          ]}
        />
        <Input
          label="Payment Terms"
          value={paymentTerms}
          onChange={(e) => setPaymentTerms(e.target.value)}
        />
        <Input
          label="Commission %"
          type="number"
          value={commissionPercent}
          onChange={(e) => setCommissionPercent(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Template"}
      </Button>
    </form>
  );
}
