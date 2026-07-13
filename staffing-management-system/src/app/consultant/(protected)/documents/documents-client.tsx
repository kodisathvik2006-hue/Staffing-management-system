"use client";

import { useState } from "react";
import Link from "next/link";
import { UploadCloud, Search, Eye, Download, RefreshCw, Trash2, Filter } from "lucide-react";

export default function DocumentsClient({ initialDocuments }: { initialDocuments: any[] }) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  
  // Pagination
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Delete Modal
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  // Filtering & Sorting
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? doc.status === statusFilter : true;
    const matchesType = typeFilter ? doc.documentType === typeFilter : true;
    return matchesSearch && matchesStatus && matchesType;
  });

  const paginatedDocs = filteredDocs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filteredDocs.length / pageSize);

  const handleDelete = async () => {
    if (!documentToDelete) return;

    try {
      const res = await fetch(`/api/consultant/documents/${documentToDelete}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDocuments(documents.filter((d) => d.id !== documentToDelete));
        setDocumentToDelete(null);
      } else {
        alert("Failed to delete document.");
      }
    } catch (e) {
      alert("Error deleting document.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">My Documents</h1>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-400">
            Manage your resumes, visas, certifications, and compliance documents.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/consultant/documents/upload"
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <UploadCloud className="h-4 w-4" />
            Upload Document
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border border-slate-300 dark:border-dark-border py-2 pl-10 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-dark-bg dark:text-white"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="block w-full sm:w-48 rounded-md border border-slate-300 dark:border-dark-border py-2 pl-3 pr-10 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white dark:bg-dark-bg dark:text-white"
        >
          <option value="">All Types</option>
          <option value="Resume">Resume</option>
          <option value="Passport">Passport</option>
          <option value="Visa">Visa</option>
          <option value="Offer Letter">Offer Letter</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="block w-full sm:w-48 rounded-md border border-slate-300 dark:border-dark-border py-2 pl-3 pr-10 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white dark:bg-dark-bg dark:text-white"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Verified">Verified</option>
          <option value="Rejected">Rejected</option>
          <option value="Expired">Expired</option>
        </select>
      </div>

      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-slate-300 dark:divide-dark-border">
                <thead className="bg-slate-50 dark:bg-dark-sidebar">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-300 sm:pl-6">
                      Document Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-300">
                      Type
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-300">
                      Upload Date
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-300">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-300">
                      File Size
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-dark-border bg-white dark:bg-dark-card">
                  {paginatedDocs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        No documents found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedDocs.map((doc) => (
                      <tr key={doc.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 dark:text-white sm:pl-6">
                          {doc.title}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                          {doc.documentType}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            doc.status === "Verified" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                            doc.status === "Rejected" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                            doc.status === "Expired" ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" :
                            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}>
                            {doc.status || "Pending"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                          {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                        </td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex justify-end gap-3">
                            <button className="text-slate-400 hover:text-brand-600 dark:hover:text-brand-400" title="View">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-slate-400 hover:text-brand-600 dark:hover:text-brand-400" title="Download">
                              <Download className="h-4 w-4" />
                            </button>
                            <button className="text-slate-400 hover:text-brand-600 dark:hover:text-brand-400" title="Replace">
                              <RefreshCw className="h-4 w-4" />
                            </button>
                            <button 
                              className="text-slate-400 hover:text-red-600 dark:hover:text-red-400" 
                              title="Delete"
                              onClick={() => setDocumentToDelete(doc.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {filteredDocs.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-700 dark:text-slate-400">Show</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="rounded-md border-slate-300 dark:border-dark-border py-1 pl-2 pr-8 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white dark:bg-dark-bg dark:text-white"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-slate-700 dark:text-slate-400">records</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="rounded border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-card px-3 py-1 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-bg disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-700 dark:text-slate-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="rounded border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-card px-3 py-1 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-bg disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {documentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-dark-card p-6 shadow-xl border border-slate-200 dark:border-dark-border">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Delete Document</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to delete this document? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDocumentToDelete(null)}
                className="rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-bg px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-sidebar"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
