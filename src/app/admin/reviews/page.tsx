"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Review {
  id: string; name: string; email: string; rating: number;
  body: string | null; status: "pending" | "approved" | "rejected"; createdAt: string;
  product: { id: string; name: string; slug: string };
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i <= rating ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

const STATUS_STYLES: Record<string, string> = {
  pending:  "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [updating, setUpdating] = useState<string | null>(null);

  function load(s: string, p: number) {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p) });
    if (s) params.set("status", s);
    fetch(`/api/admin/reviews?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setReviews(d.data ?? []);
        setTotal(d.meta?.total ?? 0);
        setPages(d.meta?.pages ?? 1);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(statusFilter, page); }, [statusFilter, page]);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdating(null);
    load(statusFilter, page);
  }

  async function deleteReview(id: string) {
    if (!confirm("Delete this review?")) return;
    setUpdating(id);
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    setUpdating(null);
    load(statusFilter, page);
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reviews</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} review{total !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["", "pending", "approved", "rejected"].map((s) => (
            <button key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors press ${
                statusFilter === s ? "bg-indigo-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-10 sm:p-14 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">No {statusFilter || "reviews"} found</p>
            <p className="text-xs text-gray-500">
              {statusFilter ? `Try switching the filter to see other reviews.` : `Customer reviews will appear here once submitted.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {reviews.map((r) => (
              <div key={r.id} className="p-5 flex gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <Stars rating={r.rating} />
                    <span className="font-semibold text-sm text-gray-900">{r.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[r.status]}`}>
                      {r.status}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString("en-EG")}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{r.email}</p>
                  <Link href={`/product/${r.product.slug}`} target="_blank"
                    className="text-xs text-indigo-600 hover:underline mb-2 block">
                    {r.product.name}
                  </Link>
                  {r.body && <p className="text-sm text-gray-700 leading-relaxed">{r.body}</p>}
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  {r.status !== "approved" && (
                    <button onClick={() => updateStatus(r.id, "approved")} disabled={updating === r.id}
                      className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 font-medium disabled:opacity-50 transition-colors">
                      Approve
                    </button>
                  )}
                  {r.status !== "rejected" && (
                    <button onClick={() => updateStatus(r.id, "rejected")} disabled={updating === r.id}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-medium disabled:opacity-50 transition-colors">
                      Reject
                    </button>
                  )}
                  <button onClick={() => deleteReview(r.id)} disabled={updating === r.id}
                    className="text-xs px-3 py-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 font-medium disabled:opacity-50 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors press">
            ← Prev
          </button>
          <span className="text-sm text-gray-600 px-2">Page {page} of {pages}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= pages}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors press">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
