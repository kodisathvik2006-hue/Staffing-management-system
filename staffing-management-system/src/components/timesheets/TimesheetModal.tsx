"use client";
import { useState, useEffect } from "react";
import { X, Save, Send } from "lucide-react";

export default function TimesheetModal({ 
  isOpen, 
  onClose, 
  projects, 
  onSuccess,
  initialData = null 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  projects: any[],
  onSuccess: () => void,
  initialData?: any
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    projectId: "",
    weekEndingDate: "",
    mondayHours: 0,
    tuesdayHours: 0,
    wednesdayHours: 0,
    thursdayHours: 0,
    fridayHours: 0,
    saturdayHours: 0,
    sundayHours: 0,
    taskDescription: "",
    workSummary: "",
    comments: ""
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        projectId: initialData.projectId,
        weekEndingDate: new Date(initialData.weekEndingDate).toISOString().split('T')[0],
        mondayHours: initialData.mondayHours || 0,
        tuesdayHours: initialData.tuesdayHours || 0,
        wednesdayHours: initialData.wednesdayHours || 0,
        thursdayHours: initialData.thursdayHours || 0,
        fridayHours: initialData.fridayHours || 0,
        saturdayHours: initialData.saturdayHours || 0,
        sundayHours: initialData.sundayHours || 0,
        taskDescription: initialData.taskDescription || "",
        workSummary: initialData.workSummary || "",
        comments: initialData.comments || ""
      });
    } else {
      setFormData({
        projectId: projects.length > 0 ? projects[0].id : "",
        weekEndingDate: "",
        mondayHours: 0, tuesdayHours: 0, wednesdayHours: 0, thursdayHours: 0, fridayHours: 0, saturdayHours: 0, sundayHours: 0,
        taskDescription: "", workSummary: "", comments: ""
      });
    }
  }, [initialData, projects, isOpen]);

  const totalHours = (Number(formData.mondayHours) + Number(formData.tuesdayHours) + Number(formData.wednesdayHours) + 
                     Number(formData.thursdayHours) + Number(formData.fridayHours) + Number(formData.saturdayHours) + 
                     Number(formData.sundayHours)).toFixed(2);

  const handleSubmit = async (status: "Draft" | "Pending") => {
    setError("");
    if (!formData.projectId) return setError("Please select a project.");
    if (!formData.weekEndingDate) return setError("Please select a week ending date.");
    
    const days = ["mondayHours", "tuesdayHours", "wednesdayHours", "thursdayHours", "fridayHours", "saturdayHours", "sundayHours"];
    for (const d of days) {
      if (Number((formData as any)[d]) > 24) return setError(`${d} cannot exceed 24 hours.`);
      if (Number((formData as any)[d]) < 0) return setError(`${d} cannot be negative.`);
    }

    setLoading(true);
    try {
      const url = initialData ? `/api/consultant/timesheets/${initialData.id}` : `/api/consultant/timesheets`;
      const method = initialData ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          mondayHours: Number(formData.mondayHours),
          tuesdayHours: Number(formData.tuesdayHours),
          wednesdayHours: Number(formData.wednesdayHours),
          thursdayHours: Number(formData.thursdayHours),
          fridayHours: Number(formData.fridayHours),
          saturdayHours: Number(formData.saturdayHours),
          sundayHours: Number(formData.sundayHours),
          status
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save timesheet");
      }

      if (status === "Pending Approval") {
        alert("Timesheet submitted successfully. Waiting for Admin Approval.");
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-0">
      <div className="bg-white dark:bg-dark-card w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-dark-border">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {initialData ? "Edit Timesheet" : "Submit Timesheet"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project</label>
              <select 
                value={formData.projectId}
                onChange={e => setFormData({...formData, projectId: e.target.value})}
                disabled={!!initialData}
                className="w-full border-slate-300 dark:border-dark-border dark:bg-dark-input rounded-md shadow-sm p-2"
              >
                <option value="">Select a Project...</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Week Ending Date (Sunday)</label>
              <input 
                type="date" 
                value={formData.weekEndingDate}
                onChange={e => setFormData({...formData, weekEndingDate: e.target.value})}
                disabled={!!initialData}
                className="w-full border-slate-300 dark:border-dark-border dark:bg-dark-input rounded-md shadow-sm p-2"
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 border-b pb-2">Daily Hours</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                <div key={day}>
                  <label className="block text-xs font-medium text-slate-500 capitalize">{day}</label>
                  <input 
                    type="number" 
                    step="0.25"
                    min="0"
                    max="24"
                    value={(formData as any)[`${day}Hours`]}
                    onChange={e => setFormData({...formData, [`${day}Hours`]: e.target.value})}
                    className="w-full border-slate-300 dark:border-dark-border dark:bg-dark-input rounded-md shadow-sm p-2 mt-1"
                  />
                </div>
              ))}
              <div className="bg-brand-50 dark:bg-brand-900/20 rounded-lg p-3 flex flex-col justify-center items-center">
                <span className="text-xs font-medium text-brand-700 dark:text-brand-300 uppercase">Total Hours</span>
                <span className="text-xl font-bold text-brand-900 dark:text-white">{totalHours}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Task Description</label>
              <input 
                type="text" 
                value={formData.taskDescription}
                onChange={e => setFormData({...formData, taskDescription: e.target.value})}
                placeholder="Brief description of tasks completed"
                className="w-full border-slate-300 dark:border-dark-border dark:bg-dark-input rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Work Summary</label>
              <textarea 
                value={formData.workSummary}
                onChange={e => setFormData({...formData, workSummary: e.target.value})}
                placeholder="Detailed summary of work done this week"
                rows={3}
                className="w-full border-slate-300 dark:border-dark-border dark:bg-dark-input rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Additional Comments (Optional)</label>
              <input 
                type="text" 
                value={formData.comments}
                onChange={e => setFormData({...formData, comments: e.target.value})}
                className="w-full border-slate-300 dark:border-dark-border dark:bg-dark-input rounded-md shadow-sm p-2"
              />
            </div>
          </div>

        </div>

        <div className="p-6 border-t border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-sidebar flex justify-end gap-3 rounded-b-xl">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 bg-white rounded-lg hover:bg-slate-50 font-medium text-sm"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={() => handleSubmit("Draft")}
            disabled={loading}
            className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-medium text-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button 
            type="button"
            onClick={() => handleSubmit("Pending Approval" as any)}
            disabled={loading || (initialData && initialData.status === "Pending Approval") || (initialData && initialData.status === "Approved")}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium text-sm flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> Submit for Approval
          </button>
        </div>
      </div>
    </div>
  );
}
