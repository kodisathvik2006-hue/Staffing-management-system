"use client";

import { useState, useEffect } from "react";
import { Check, X, Undo, Eye, FileText, CheckCircle, Clock } from "lucide-react";

export default function AdminTimesheetsClient() {
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  
  // Modals state
  const [approveConfirmTs, setApproveConfirmTs] = useState<any>(null);
  const [rejectModalTs, setRejectModalTs] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [detailsModalTs, setDetailsModalTs] = useState<any>(null);

  const fetchTimesheets = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/timesheets");
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

  const handleAction = async (id: string, status: string, comments: string = "") => {
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/timesheets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, comments })
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      if (status === "Approved") alert("Timesheet Approved Successfully.");
      if (status === "Rejected") alert("Timesheet Rejected.");
      
      fetchTimesheets();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(null);
      setApproveConfirmTs(null);
      setRejectModalTs(null);
      setRejectReason("");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved": return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"><CheckCircle className="w-3 h-3"/> Approved</span>;
      case "Rejected": return <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">Rejected</span>;
      case "Pending Approval": return <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800"><Clock className="w-3 h-3"/> Pending Approval</span>;
      case "Returned": return <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">Returned</span>;
      default: return <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">{status}</span>;
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading timesheets...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-300 dark:divide-dark-border">
            <thead className="bg-slate-50 dark:bg-dark-sidebar">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-300">Consultant</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-300">Vendor</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-300">Client</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-300">Project</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-300">Week Ending</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-300">Total Hours</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-300">Submitted Date</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-300">Status</th>
                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
              {timesheets.length === 0 ? (
                <tr><td colSpan={9} className="py-8 text-center text-sm text-slate-500">No timesheets found.</td></tr>
              ) : (
                timesheets.map((ts) => (
                  <tr key={ts.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-sidebar/50 transition">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 dark:text-white">
                      {ts.consultant?.firstName} {ts.consultant?.lastName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {ts.consultant?.vendor?.legalName || "-"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {ts.project?.client?.legalName || "-"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {ts.project?.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(ts.weekEndingDate).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-brand-600 dark:text-brand-400">
                      {ts.hoursWorked} hrs
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {ts.submittedDate ? new Date(ts.submittedDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      {getStatusBadge(ts.status)}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex justify-end gap-2">
                        {ts.status === "Pending Approval" && (
                          <>
                            <button 
                              disabled={processing === ts.id}
                              onClick={() => setApproveConfirmTs(ts)} 
                              className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 rounded text-xs" 
                              title="Approve">
                              <Check className="h-3 w-3 mr-1" /> Approve
                            </button>
                            <button 
                              disabled={processing === ts.id}
                              onClick={() => setRejectModalTs(ts)} 
                              className="inline-flex items-center px-2 py-1 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded text-xs" 
                              title="Reject">
                              <X className="h-3 w-3 mr-1" /> Reject
                            </button>
                          </>
                        )}
                        <button 
                          className="inline-flex items-center px-2 py-1 text-slate-500 border border-transparent hover:text-slate-900 rounded text-xs" 
                          title="View Details"
                          onClick={() => setDetailsModalTs(ts)}
                        >
                          <Eye className="h-3 w-3 mr-1" /> Details
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

      {/* Approve Confirm Modal */}
      {approveConfirmTs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-dark-card w-full max-w-sm rounded-xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Approve Timesheet?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to approve the timesheet for {approveConfirmTs.consultant?.firstName} {approveConfirmTs.consultant?.lastName}? This action will lock the timesheet and make it available for invoicing.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setApproveConfirmTs(null)} className="px-4 py-2 border border-slate-300 text-slate-700 bg-white rounded-lg hover:bg-slate-50 font-medium text-sm">Cancel</button>
              <button onClick={() => handleAction(approveConfirmTs.id, "Approved")} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">Approve</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalTs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-dark-card w-full max-w-md rounded-xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Reject Timesheet</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Please provide a reason for rejecting this timesheet.
            </p>
            <textarea 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Rejection Reason..."
              rows={4}
              className="w-full border border-slate-300 dark:border-dark-border dark:bg-dark-input rounded-md shadow-sm p-3 mb-6 focus:ring-brand-500 focus:border-brand-500 text-sm text-slate-900 dark:text-white"
            ></textarea>
            <div className="flex justify-end gap-3">
              <button onClick={() => setRejectModalTs(null)} className="px-4 py-2 border border-slate-300 text-slate-700 bg-white rounded-lg hover:bg-slate-50 font-medium text-sm">Cancel</button>
              <button onClick={() => handleAction(rejectModalTs.id, "Rejected", rejectReason)} disabled={!rejectReason.trim()} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm disabled:opacity-50">Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailsModalTs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-dark-card w-full max-w-3xl rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Timesheet Details</h3>
              <button onClick={() => setDetailsModalTs(null)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6"/></button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
              <div>
                <p className="text-slate-500 font-medium">Consultant</p>
                <p className="font-semibold text-slate-900 dark:text-white">{detailsModalTs.consultant?.firstName} {detailsModalTs.consultant?.lastName}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Vendor</p>
                <p className="font-semibold text-slate-900 dark:text-white">{detailsModalTs.consultant?.vendor?.legalName || "N/A"}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Project</p>
                <p className="font-semibold text-slate-900 dark:text-white">{detailsModalTs.project?.name}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Client</p>
                <p className="font-semibold text-slate-900 dark:text-white">{detailsModalTs.project?.client?.legalName || "N/A"}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Week Ending</p>
                <p className="font-semibold text-slate-900 dark:text-white">{new Date(detailsModalTs.weekEndingDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Total Hours</p>
                <p className="font-bold text-brand-600">{detailsModalTs.hoursWorked} hrs</p>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="font-semibold text-slate-900 dark:text-white border-b pb-2 mb-4">Daily Breakdown</h4>
              <div className="grid grid-cols-7 gap-2 text-center text-sm">
                <div className="bg-slate-50 dark:bg-dark-sidebar p-2 rounded">
                  <p className="text-xs text-slate-500">Mon</p>
                  <p className="font-medium">{detailsModalTs.mondayHours}</p>
                </div>
                <div className="bg-slate-50 dark:bg-dark-sidebar p-2 rounded">
                  <p className="text-xs text-slate-500">Tue</p>
                  <p className="font-medium">{detailsModalTs.tuesdayHours}</p>
                </div>
                <div className="bg-slate-50 dark:bg-dark-sidebar p-2 rounded">
                  <p className="text-xs text-slate-500">Wed</p>
                  <p className="font-medium">{detailsModalTs.wednesdayHours}</p>
                </div>
                <div className="bg-slate-50 dark:bg-dark-sidebar p-2 rounded">
                  <p className="text-xs text-slate-500">Thu</p>
                  <p className="font-medium">{detailsModalTs.thursdayHours}</p>
                </div>
                <div className="bg-slate-50 dark:bg-dark-sidebar p-2 rounded">
                  <p className="text-xs text-slate-500">Fri</p>
                  <p className="font-medium">{detailsModalTs.fridayHours}</p>
                </div>
                <div className="bg-slate-50 dark:bg-dark-sidebar p-2 rounded">
                  <p className="text-xs text-slate-500">Sat</p>
                  <p className="font-medium">{detailsModalTs.saturdayHours}</p>
                </div>
                <div className="bg-slate-50 dark:bg-dark-sidebar p-2 rounded">
                  <p className="text-xs text-slate-500">Sun</p>
                  <p className="font-medium">{detailsModalTs.sundayHours}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white">Task Description</h4>
                <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-dark-sidebar p-3 rounded mt-1">{detailsModalTs.taskDescription || "None provided"}</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white">Work Summary</h4>
                <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-dark-sidebar p-3 rounded mt-1 whitespace-pre-wrap">{detailsModalTs.workSummary || "None provided"}</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white">Comments</h4>
                <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-dark-sidebar p-3 rounded mt-1">{detailsModalTs.comments || "None provided"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
