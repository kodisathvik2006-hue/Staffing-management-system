import AdminTimesheetsClient from "@/components/timesheets/AdminTimesheetsClient";

export default function AdminTimesheetsPage() {
  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Timesheet Management</h1>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-400">
            Review and approve timesheets submitted by consultants.
          </p>
        </div>
      </div>
      <AdminTimesheetsClient />
    </div>
  );
}
