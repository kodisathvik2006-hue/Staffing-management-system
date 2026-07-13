"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, FileText, CheckCircle, Clock } from "lucide-react";
import TimesheetModal from "./TimesheetModal";

export default function ConsultantTimesheetsClient({ projects }: { projects: any[] }) {
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTs, setEditingTs] = useState<any>(null);

  const fetchTimesheets = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/consultant/timesheets");
      if (!res.ok) throw new Error("Failed to fetch timesheets");
      const data = await res.json();
      setTimesheets(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimesheets();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this draft timesheet?")) return;
    try {
      const res = await fetch(`/api/consultant/timesheets/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchTimesheets();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved": return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"><CheckCircle className="w-3 h-3"/> Approved</span>;
      case "Rejected": return <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">Rejected</span>;
      case "Pending Approval": return <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800"><Clock className="w-3 h-3"/> Pending Approval</span>;
      case "Returned": return <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">Returned</span>;
      default: return <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">Draft</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Timesheets</h1>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-400">
            Submit and track your weekly timesheets for approval.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => { setEditingTs(null); setIsModalOpen(true); }}
            type="button"
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 shadow-sm transition"
          >
            <Plus className="h-4 w-4" />
            Submit Timesheet
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-300 dark:divide-dark-border">
            <thead className="bg-slate-50 dark:bg-dark-sidebar">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-300">Project</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-300">Week Ending</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-300">Total Hours</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-300">Status</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-300">Last Updated</th>
                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-sm text-slate-500">Loading timesheets...</td></tr>
              ) : timesheets.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-sm text-slate-500">No timesheets submitted yet.</td></tr>
              ) : (
                timesheets.map((ts) => (
                  <tr key={ts.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-sidebar/50 transition">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 dark:text-white">
                      {ts.project?.name || "Unknown Project"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(ts.weekEndingDate).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {ts.hoursWorked} hrs
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      {getStatusBadge(ts.status)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(ts.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex justify-end gap-3">
                        {(ts.status === "Draft" || ts.status === "Returned" || ts.status === "Rejected") ? (
                          <>
                            {ts.status === "Rejected" && (
                              <button onClick={() => alert(`Rejection Reason: ${ts.rejectionReason || 'No reason provided'}`)} className="text-red-500 hover:text-red-700 font-medium text-xs mr-2">
                                View Reason
                              </button>
                            )}
                            <button onClick={() => { setEditingTs(ts); setIsModalOpen(true); }} className="text-brand-600 hover:text-brand-900" title="Edit">
                              <Edit className="h-4 w-4" />
                            </button>
                            {ts.status === "Draft" && (
                              <button onClick={() => handleDelete(ts.id)} className="text-red-600 hover:text-red-900" title="Delete">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </>
                        ) : (
                          <button onClick={() => { setEditingTs(ts); setIsModalOpen(true); }} className="text-slate-500 hover:text-slate-700" title="View Details">
                            <FileText className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TimesheetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        projects={projects}
        initialData={editingTs}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchTimesheets();
        }}
      />
    </div>
  );
}

