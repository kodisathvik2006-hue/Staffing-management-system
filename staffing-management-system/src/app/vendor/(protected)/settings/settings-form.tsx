"use client";

import { useState } from "react";
import { Button } from "@/components/forms";
import { updateVendorSettings } from "./actions";
import { CheckCircle, AlertCircle } from "lucide-react";

interface VendorData {
  legalName: string;
  email: string | null;
  mobile: string | null;
  website: string | null;
  taxId: string | null;
  registeredAddress: string | null;
}

export function VendorSettingsForm({ vendor }: { vendor: VendorData }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      legalName: formData.get("legalName") as string,
      mobile: formData.get("mobile") as string,
      website: formData.get("website") as string,
      taxId: formData.get("taxId") as string,
      address: formData.get("address") as string,
    };

    const res = await updateVendorSettings(data);
    setLoading(false);

    if (res.error) {
      setStatus({ type: "error", message: res.error });
    } else {
      setStatus({ type: "success", message: "Settings saved successfully!" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status && (
        <div className={`flex items-center gap-2 rounded-lg p-4 text-sm font-medium ${status.type === "success" ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"}`}>
          {status.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {status.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="legalName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Company Name
          </label>
          <input
            type="text"
            name="legalName"
            id="legalName"
            required
            defaultValue={vendor.legalName}
            className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-dark-border dark:bg-dark-card dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Primary Email
          </label>
          <input
            type="email"
            id="email"
            disabled
            defaultValue={vendor.email || ""}
            className="block w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 opacity-75 dark:border-dark-border dark:bg-dark-card/50 dark:text-slate-400 cursor-not-allowed"
          />
          <p className="text-xs text-slate-500">Email cannot be changed directly.</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="mobile" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Contact Number
          </label>
          <input
            type="tel"
            name="mobile"
            id="mobile"
            defaultValue={vendor.mobile || ""}
            className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-dark-border dark:bg-dark-card dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="website" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Website URL
          </label>
          <input
            type="url"
            name="website"
            id="website"
            placeholder="https://"
            defaultValue={vendor.website || ""}
            className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-dark-border dark:bg-dark-card dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="taxId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Tax ID / EIN
          </label>
          <input
            type="text"
            name="taxId"
            id="taxId"
            defaultValue={vendor.taxId || ""}
            className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-dark-border dark:bg-dark-card dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Registered Address
        </label>
        <textarea
          name="address"
          id="address"
          rows={3}
          defaultValue={vendor.registeredAddress || ""}
          className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-dark-border dark:bg-dark-card dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400 resize-none"
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
