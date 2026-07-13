import { getSession } from "@/lib/jwt";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function ConsultantProfile() {
  const session = await getSession();
  if (!session || !session.roles.some((r) => r.role === "CONSULTANT")) {
    redirect("/consultant/login");
  }

  const consultant = await prisma.consultant.findUnique({
    where: { id: session.sub },
    include: {
      vendor: true,
    },
  });

  if (!consultant) redirect("/consultant/login");

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-slate-900">My Profile</h1>
          <p className="mt-2 text-sm text-slate-700">
            Manage your personal information and skills.
          </p>
        </div>
      </div>

      <div className="overflow-hidden bg-white shadow sm:rounded-lg border border-slate-200">
        <div className="px-4 py-6 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-base font-semibold leading-7 text-slate-900">Consultant Information</h3>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">Personal details and application.</p>
          </div>
          <button className="text-sm font-medium text-brand-600 hover:text-brand-500">
            Edit Profile
          </button>
        </div>
        <div className="border-t border-slate-100">
          <dl className="divide-y divide-slate-100">
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-slate-900">Name</dt>
              <dd className="mt-1 text-sm leading-6 text-slate-700 sm:col-span-2 sm:mt-0">{consultant.firstName} {consultant.lastName}</dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-slate-900">Email address</dt>
              <dd className="mt-1 text-sm leading-6 text-slate-700 sm:col-span-2 sm:mt-0">{consultant.email}</dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-slate-900">Mobile number</dt>
              <dd className="mt-1 text-sm leading-6 text-slate-700 sm:col-span-2 sm:mt-0">{consultant.mobileNumber || "N/A"}</dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-slate-900">Visa Status</dt>
              <dd className="mt-1 text-sm leading-6 text-slate-700 sm:col-span-2 sm:mt-0">{consultant.visaStatus || "N/A"}</dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-slate-900">Emergency Contact</dt>
              <dd className="mt-1 text-sm leading-6 text-slate-700 sm:col-span-2 sm:mt-0">{consultant.emergencyContact || "N/A"}</dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-slate-900">Experience</dt>
              <dd className="mt-1 text-sm leading-6 text-slate-700 sm:col-span-2 sm:mt-0">{consultant.experience || "N/A"}</dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-slate-900">Skills</dt>
              <dd className="mt-1 text-sm leading-6 text-slate-700 sm:col-span-2 sm:mt-0">
                {consultant.skills.length > 0 ? consultant.skills.join(", ") : "N/A"}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-slate-900">Vendor Assignment</dt>
              <dd className="mt-1 text-sm leading-6 text-slate-700 sm:col-span-2 sm:mt-0">
                {consultant.vendor ? consultant.vendor.legalName : "Direct Consultant (No Vendor)"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
