"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UploadCloud, File, AlertCircle, CheckCircle2 } from "lucide-react";

const DOCUMENT_TYPES = [
  "Resume",
  "Passport",
  "Visa",
  "Work Authorization",
  "SSN",
  "Driving License",
  "Offer Letter",
  "Degree Certificate",
  "Experience Letter",
  "Other",
];

export default function DocumentUploadPage() {
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;

    // Validation: 20MB limit
    if (selectedFile.size > 20 * 1024 * 1024) {
      setError("File size exceeds 20MB limit.");
      e.target.value = "";
      return;
    }

    // Validation: Type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Invalid file format. Please upload PDF, DOC, DOCX, PNG, JPG, or JPEG.");
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !documentType || !file) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Mock progress interval
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("documentType", documentType);
      formData.append("notes", notes);
      formData.append("file", file);

      const res = await fetch("/api/consultant/documents/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to upload document");
      }

      setSuccess("Document uploaded successfully!");
      
      // Delay slightly so user sees 100% and success toast
      setTimeout(() => {
        router.push("/consultant/documents");
        router.refresh();
      }, 1500);

    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message || "An error occurred during upload.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Upload Document</h1>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-400">
            Securely upload compliance and identity documents to your profile.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-sm overflow-hidden transition-colors duration-200">
        {/* Success Toast Placeholder - Inline for now */}
        {success && (
          <div className="bg-green-50 p-4 border-b border-green-100 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <p className="text-sm font-medium text-green-800">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Document Title *
              </label>
              <input
                type="text"
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 dark:border-dark-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-dark-bg dark:text-white"
                placeholder="e.g. Current Passport"
                disabled={isUploading}
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Document Type *
              </label>
              <select
                id="type"
                required
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 dark:border-dark-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white dark:bg-dark-bg dark:text-white"
                disabled={isUploading}
              >
                <option value="">Select a document type</option>
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              File Upload * (Max 20MB)
            </label>
            <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-slate-300 dark:border-dark-border px-6 pt-5 pb-6 hover:bg-slate-50 dark:hover:bg-dark-bg transition-colors">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
                <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md bg-transparent font-medium text-brand-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2 hover:text-brand-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  PDF, DOC, DOCX, PNG, JPG up to 20MB
                </p>
              </div>
            </div>
            {file && (
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-dark-bg p-3 rounded-md border border-slate-200 dark:border-dark-border">
                <File className="h-4 w-4 text-slate-400" />
                <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                <span className="text-slate-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 dark:border-dark-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-dark-bg dark:text-white"
              placeholder="Any additional information about this document..."
              disabled={isUploading}
            />
          </div>

          {isUploading && (
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div
                className="bg-brand-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <p className="text-xs text-center mt-2 text-slate-500">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100 dark:border-dark-border">
            <Link
              href="/consultant/documents"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isUploading || !file || !title || !documentType}
              className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
            >
              {isUploading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
