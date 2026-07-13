"use client";

import { useState, useEffect } from "react";
import { Download, Eye, FileText } from "lucide-react";
import Link from "next/link";

export default function InvoiceListClient({ role }: { role: string }) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const res = await fetch(`/api/invoices?role=${role}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP error ${res.status}`);
        }
        const data = await res.json();
        setInvoices(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, [role]);

  const handleDownload = async (id: string, invoiceNumber: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}/pdf`);
      if (!res.ok) throw new Error("Failed to generate PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice_${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-400">Paid</span>;
      case "OVERDUE":
        return <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:text-red-400">Overdue</span>;
      case "DRAFT":
        return <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-300">Draft</span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:text-yellow-400">{status}</span>;
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading invoices...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Invoices</h1>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-400">
            A list of all invoices generated for your projects.
          </p>
        </div>
      </div>
      
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-sm transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-300 dark:divide-dark-border">
            <thead className="bg-slate-50 dark:bg-dark-sidebar">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-300">Invoice No.</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-300">Project</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-300">Client</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-300">Billing Month</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-300">Hours</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-300">Net Amount</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-300">Status</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-300">Due Date</th>
                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-dark-border bg-white dark:bg-dark-card">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400" />
                        {inv.invoiceNumber}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">{inv.projectName}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">{inv.clientName}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">{inv.billingMonth}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">{inv.hours} hrs</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-900 dark:text-white font-medium">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: inv.currency }).format(inv.netAmount)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      {getStatusBadge(inv.status)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">{new Date(inv.dueDate).toLocaleDateString()}</td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex justify-end gap-3">
                        <Link 
                          href={role === "consultant" ? `/consultant/invoices/${inv.id}` : `/invoices/${inv.id}`}
                          className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300"
                          title="View Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button 
                          onClick={() => handleDownload(inv.id, inv.invoiceNumber)}
                          className="text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300"
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
