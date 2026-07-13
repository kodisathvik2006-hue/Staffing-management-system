"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui";

export default function VendorProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/vendor/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data.data);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/vendor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setMessage("Profile updated successfully!");
      } else {
        setMessage("Failed to update profile.");
      }
    } catch {
      setMessage("Error updating profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Company Profile" description="Update your contact details" />

      {message && (
        <div className="mb-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-slate-700">Legal Name</label>
          <input
            type="text"
            disabled
            value={profile?.legalName || ""}
            className="mt-1 block w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500 shadow-sm"
          />
          <p className="mt-1 text-xs text-slate-500">Legal name cannot be changed.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Registered Address</label>
          <input
            type="text"
            value={profile?.registeredAddress || ""}
            onChange={(e) => setProfile({ ...profile, registeredAddress: e.target.value })}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Communication Address</label>
          <input
            type="text"
            value={profile?.communicationAddress || ""}
            onChange={(e) => setProfile({ ...profile, communicationAddress: e.target.value })}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
