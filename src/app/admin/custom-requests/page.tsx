"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface CustomRequest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  requestType: string;
  description: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
}

interface Meta { total: number; page: number; pages: number }

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending",  label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "architecture", label: "Architecture" },
  { value: "gift",         label: "Gift" },
  { value: "dental",       label: "Dental" },
  { value: "mechanical",   label: "Mechanical" },
];

const STATUS_COLORS: Record<string, string> = {
  pending:  "bg-amber-100 text-amber-700",
  reviewed: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

function CustomRequestsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);

  const status = searchParams.get("status") ?? "";
  const type   = searchParams.get("type")   ?? "";
  const search = searchParams.get("search") ?? "";
  const page   = Number(searchParams.get("page") ?? "1");
  const [searchInput, setSearchInput] = useState(search);

  function setParam(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value); else p.delete(key);
    p.set("page", "1");
    router.push(`/admin/custom-requests?${p.toString()}`);
  }

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams({ page: String(page), limit: "20" });
    if (status) p.set("status", status);
    if (type)   p.set("type", type);
    if (search) p.set("search", search);
    fetch(`/api/admin/custom-requests?${p.toString()}`)
      .then((r) => r.json())
      .then((d) => { setRequests(d?.data ?? []); setMeta(d?.meta ?? null); })
      .finally(() => setLoading(false));
  }, [status, type, search, page]);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Custom Requests</h1>
        {meta && <p className="text-sm text-gray-500 mt-0.5">{meta.total} total</p>}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={(e) => { e.preventDefault(); setParam("search", searchInput); }} className="flex gap-2 flex-1">
          <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name, email..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white"
          />
          <button type="submit" className="border border-gray-200 bg-white text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50">Search</button>
        </form>
        <select value={status} onChange={(e) => setParam("status", e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400"
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={type} onChange={(e) => setParam("type", e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400"
        >
          {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No requests found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900">{req.fullName}</p>
                        <p className="text-xs text-gray-400">{req.phone}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-medium capitalize bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{req.requestType}</span>
                      </td>
                      <td className="px-5 py-3 max-w-[220px]">
                        <p className="text-gray-600 text-xs truncate">{req.description}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[req.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500">
                        {new Date(req.createdAt).toLocaleDateString("en-EG")}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link href={`/admin/custom-requests/${req.id}`}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta && meta.pages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">Page {meta.page} of {meta.pages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setParam("page", String(page - 1))} disabled={page <= 1}
                    className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                  >← Prev</button>
                  <button onClick={() => setParam("page", String(page + 1))} disabled={page >= meta.pages}
                    className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                  >Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminCustomRequestsPage() {
  return <Suspense><CustomRequestsInner /></Suspense>;
}
