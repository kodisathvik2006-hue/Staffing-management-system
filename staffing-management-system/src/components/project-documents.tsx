"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button, Input, Select } from "@/components/forms";

const DOCUMENT_TYPES = [
  { value: "CLIENT_MSA", label: "Client MSA" },
  { value: "CLIENT_SOW", label: "Client SOW" },
  { value: "CONSULTANT_NDA", label: "Consultant NDA" },
  { value: "CONSULTANT_OFFER_LETTER", label: "Consultant Offer Letter" },
  { value: "VENDOR_CONTRACT", label: "Vendor Contract" },
  { value: "COMMISSION_AGREEMENT", label: "Commission Agreement" },
  { value: "MISCELLANEOUS", label: "Miscellaneous" },
];

interface DocumentRow {
  id: string;
  title: string;
  documentType: string;
  isRequired: boolean;
  versions: Array<{
    id: string;
    version: number;
    fileName: string;
    fileSize: number;
    createdAt: string;
    downloadUrl?: string;
    uploadedBy: { firstName: string; lastName: string };
  }>;
}

export function ProjectDocuments({
  projectId,
  documents,
}: {
  projectId: string;
  documents: DocumentRow[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState("CLIENT_MSA");
  const [documentId, setDocumentId] = useState("");

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file || !title) return;

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("documentType", documentType);
    if (documentId) formData.append("documentId", documentId);

    try {
      const res = await fetch(`/api/projects/${projectId}/documents`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }
      setTitle("");
      setDocumentId("");
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleUpload}
        className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
      >
        <h3 className="font-medium text-slate-900">Upload Document</h3>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Select
            label="Document Type"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            options={DOCUMENT_TYPES}
          />
        </div>
        {documents.length > 0 && (
          <Select
            label="New version of existing document (optional)"
            value={documentId}
            onChange={(e) => {
              setDocumentId(e.target.value);
              const doc = documents.find((d) => d.id === e.target.value);
              if (doc) {
                setTitle(doc.title);
                setDocumentType(doc.documentType);
              }
            }}
            options={[
              { value: "", label: "— New document —" },
              ...documents.map((d) => ({
                value: d.id,
                label: `${d.title} (v${d.versions[0]?.version ?? 0})`,
              })),
            ]}
          />
        )}
        <input ref={fileRef} type="file" required className="text-sm" />
        <Button type="submit" disabled={loading} size="sm">
          {loading ? "Uploading..." : "Upload"}
        </Button>
      </form>

      {documents.length === 0 ? (
        <p className="text-sm text-slate-500">No documents uploaded yet.</p>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{doc.title}</p>
                  <p className="text-xs text-slate-500">
                    {doc.documentType.replace(/_/g, " ")}
                    {doc.isRequired && " · Required"}
                  </p>
                </div>
              </div>
              {doc.versions.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  {doc.versions.map((v) => (
                    <li key={v.id} className="flex items-center justify-between">
                      <span>
                        v{v.version} — {v.fileName} (
                        {Math.round(v.fileSize / 1024)} KB) by{" "}
                        {v.uploadedBy.firstName} {v.uploadedBy.lastName}
                      </span>
                      {v.downloadUrl && (
                        <a
                          href={v.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-600 hover:underline"
                        >
                          Download
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
