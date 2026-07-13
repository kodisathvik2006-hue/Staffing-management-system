import prisma from "@/lib/prisma";
import { getSession } from "@/lib/jwt";
import { PageHeader } from "@/components/ui";
import { redirect } from "next/navigation";

export default async function VendorConsultantsPage() {
  const session = await getSession();
  const vendorId = session?.vendorId;

  if (!vendorId) {
    redirect("/login");
  }

  const consultants = await prisma.consultant.findMany({
    where: { vendorId },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });

  return (
    <div>
      <PageHeader title="My Consultants" description="Manage your consultants" />

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Email</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Mobile</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Visa Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {consultants.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  No consultants found.
                </td>
              </tr>
            ) : (
              consultants.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium">{c.firstName} {c.lastName}</td>
                  <td className="px-4 py-3">{c.personalEmail || "N/A"}</td>
                  <td className="px-4 py-3">{c.mobileNumber || "N/A"}</td>
                  <td className="px-4 py-3">{c.visaStatus || "N/A"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
