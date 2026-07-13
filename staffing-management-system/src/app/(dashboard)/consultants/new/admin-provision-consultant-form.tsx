"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, FormError, Input } from "@/components/forms";

export function AdminProvisionConsultantForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [skills, setSkills] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      firstName,
      lastName,
      email,
      phone: phone || undefined,
      skills: skills || undefined,
      vendorId: vendorId || undefined,
      password,
    };

    try {
      const res = await fetch("/api/admin/consultants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Provisioning failed");
        return;
      }
      router.push("/consultants");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900">
        Provision New Consultant Account
      </h2>

      <FormError message={error} />

      <Input
        label="First Name *"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
      />
      <Input
        label="Last Name *"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        required
      />
      <Input
        label="Email Address (For Login) *"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        label="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <Input
        label="Skills (comma-separated)"
        value={skills}
        onChange={(e) => setSkills(e.target.value)}
      />
      <Input
        label="Vendor ID (Optional)"
        value={vendorId}
        onChange={(e) => setVendorId(e.target.value)}
      />
      <Input
        label="Password *"
        type="text"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Provisioning..." : "Create Account"}
        </Button>
        <Link href="/consultants">
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}
