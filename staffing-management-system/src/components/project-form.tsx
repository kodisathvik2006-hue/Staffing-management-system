"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, FormError, Input, Select } from "@/components/forms";

interface Option {
  id: string;
  label: string;
}

interface TemplateOption {
  id: string;
  name: string;
  defaultClientRate?: number | null;
  defaultPayRate?: number | null;
  paymentTerms?: string | null;
  invoiceSchedule?: string;
  paymentMode?: string;
  currency?: string;
}

interface ProjectFormProps {
  clients: Option[];
  consultants: Option[];
  vendors: Option[];
  templates: TemplateOption[];
  salespeople?: Option[];
  initialData?: any;
}

export function ProjectForm({
  clients,
  consultants,
  vendors,
  templates,
  salespeople = [],
}: ProjectFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [clientId, setClientId] = useState("");
  const [consultantId, setConsultantId] = useState("");
  const [upstreamVendorId, setUpstreamVendorId] = useState("");
  const [downstreamVendorId, setDownstreamVendorId] = useState("");
  const [clientRatePerHour, setClientRatePerHour] = useState("");
  const [payRatePerHour, setPayRatePerHour] = useState("");
  const [invoiceSchedule, setInvoiceSchedule] = useState("MONTHLY");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [paymentMode, setPaymentMode] = useState("ACH");
  const [invoiceEmail, setInvoiceEmail] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [startDate, setStartDate] = useState("");
  const [commissionPercent, setCommissionPercent] = useState("10");
  const [salespersonId, setSalespersonId] = useState("");

  function applyTemplate(id: string) {
    setTemplateId(id);
    const template = templates.find((t) => t.id === id);
    if (!template) return;
    if (template.defaultClientRate)
      setClientRatePerHour(String(template.defaultClientRate));
    if (template.defaultPayRate)
      setPayRatePerHour(String(template.defaultPayRate));
    if (template.paymentTerms) setPaymentTerms(template.paymentTerms);
    if (template.invoiceSchedule) setInvoiceSchedule(template.invoiceSchedule);
    if (template.paymentMode) setPaymentMode(template.paymentMode);
    if (template.currency) setCurrency(template.currency);
  }



  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const commissionRules: any[] = [];

    const payload = {
      name,
      templateId: templateId || undefined,
      clientId,
      consultantId,
      upstreamVendorId: upstreamVendorId || undefined,
      downstreamVendorId: downstreamVendorId || undefined,
      clientRatePerHour: parseFloat(clientRatePerHour),
      payRatePerHour: parseFloat(payRatePerHour),
      invoiceSchedule,
      paymentTerms: paymentTerms || undefined,
      paymentMode,
      invoiceEmail: invoiceEmail || undefined,
      currency,
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      salespersonId: salespersonId || undefined,
      commissionRules,
    };

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create project");
        return;
      }
      router.push(`/projects/${data.data.id}`);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const emptyOption = { value: "", label: "— Select —" };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900">New Project</h2>
      <FormError message={error} />

      {templates.length > 0 && (
        <Select
          label="Apply Template (optional)"
          value={templateId}
          onChange={(e) => applyTemplate(e.target.value)}
          options={[
            emptyOption,
            ...templates.map((t) => ({ value: t.id, label: t.name })),
          ]}
        />
      )}

      <Input
        label="Project Name *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="Client - Role Title"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Client *"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          required
          options={[
            emptyOption,
            ...clients.map((c) => ({ value: c.id, label: c.label })),
          ]}
        />
        <Select
          label="Consultant *"
          value={consultantId}
          onChange={(e) => setConsultantId(e.target.value)}
          required
          options={[
            emptyOption,
            ...consultants.map((c) => ({ value: c.id, label: c.label })),
          ]}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Upstream Vendor"
          value={upstreamVendorId}
          onChange={(e) => setUpstreamVendorId(e.target.value)}
          options={[
            emptyOption,
            ...vendors.map((v) => ({ value: v.id, label: v.label })),
          ]}
        />
        <Select
          label="Downstream Vendor"
          value={downstreamVendorId}
          onChange={(e) => setDownstreamVendorId(e.target.value)}
          options={[
            emptyOption,
            ...vendors.map((v) => ({ value: v.id, label: v.label })),
          ]}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Salesperson (optional)"
          value={salespersonId}
          onChange={(e) => setSalespersonId(e.target.value)}
          options={[
            emptyOption,
            ...salespeople.map((s) => ({ value: s.id, label: s.label })),
          ]}
        />
      </div>



      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="Client Rate/hr *"
          type="number"
          step="0.01"
          value={clientRatePerHour}
          onChange={(e) => setClientRatePerHour(e.target.value)}
          required
        />
        <Input
          label="Pay Rate/hr *"
          type="number"
          step="0.01"
          value={payRatePerHour}
          onChange={(e) => setPayRatePerHour(e.target.value)}
          required
        />
        <Input
          label="Commission % (markup)"
          type="number"
          step="0.1"
          value={commissionPercent}
          onChange={(e) => setCommissionPercent(e.target.value)}
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
        <Select
          label="Payment Mode"
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value)}
          options={[
            { value: "ACH", label: "ACH" },
            { value: "WIRE", label: "Wire" },
            { value: "CHECK", label: "Check" },
            { value: "ZELLE", label: "Zelle" },
            { value: "OTHER", label: "Other" },
          ]}
        />
        <Select
          label="Currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          options={[
            { value: "USD", label: "USD" },
            { value: "INR", label: "INR" },
          ]}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Payment Terms"
          value={paymentTerms}
          onChange={(e) => setPaymentTerms(e.target.value)}
          placeholder="Net 30"
        />
        <Input
          label="Invoice Email"
          type="email"
          value={invoiceEmail}
          onChange={(e) => setInvoiceEmail(e.target.value)}
        />
      </div>

      <Input
        label="Start Date"
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Project"}
        </Button>
        <Link href="/projects">
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}
