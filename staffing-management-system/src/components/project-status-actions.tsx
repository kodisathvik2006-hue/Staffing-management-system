"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Select } from "@/components/forms";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  PAUSED: "Paused",
  TERMINATED: "Terminated",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

export function ProjectStatusActions({
  projectId,
  currentStatus,
  allowedTransitions,
}: {
  projectId: string;
  currentStatus: string;
  allowedTransitions: string[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(allowedTransitions[0] ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (allowedTransitions.length === 0) return null;

  async function handleTransition() {
    if (!status) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/projects/${projectId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Status change failed");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Select
        label="Change Status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        options={allowedTransitions.map((s) => ({
          value: s,
          label: STATUS_LABELS[s] ?? s,
        }))}
      />
      <Button onClick={handleTransition} disabled={loading || !status} size="sm">
        {loading ? "Updating..." : "Apply"}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
