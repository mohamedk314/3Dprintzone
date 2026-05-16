"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface CustomRequest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  requestType: string;
  description: string;
  referenceUrl: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_OPTIONS = [
  { value: "pending",  label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_COLORS: Record<string, string> = {
  pending:  "bg-amber-100 text-amber-700",
  reviewed: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const TYPE_ICONS: Record<string, string> = {
  architecture: "🏛️", gift: "🎁", dental: "🦷", mechanical: "⚙️",
};

export default function AdminCustomRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<CustomRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [newStatus, setNewStatus] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    fetch(`/api/admin/custom-requests/${id}`)
      .then((r) => { if (r.status === 404) { setNotFound(true); return null; } return r.json(); })
      .then((d) => {
        if (!d) return;
        const req = d?.data;
        setRequest(req);
        setNewStatus(req?.status ?? "pending");
        setNewNotes(req?.adminNotes ?? "");
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!request) return;
    setUpdating(true);
    setUpdateMsg(null);
    try {
      const body: Record<string, unknown> = {};
      if (newStatus !== request.status) body.status = newStatus;
      if (newNotes !== (request.adminNotes ?? "")) body.adminNotes = newNotes;

      if (Object.keys(body).length === 0) {
        setUpdateMsg({ text: "No changes made.", ok: true });
        setUpdating(false);
        return;
      }

      const res = await fetch(`/api/admin/custom-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setRequest(data.data);
        setNewStatus(data.data.status);
        setNewNotes(data.data.adminNotes ?? "");
        setUpdateMsg({ text: "Request updated successfully.", ok: true });
      } else {
        setUpdateMsg({ text: data.message || "Update failed.", ok: false });
      }
    } catch {
      setUpdateMsg({ text: "Network error.", ok: false });
    } finally {
      setUpdating(false);
      setTimeout(() => setUpdateMsg(null), 4000);
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 animate-pulse space-y-4 max-w-3xl">
        <div className="h-6 bg-gray-200 rounded w-48" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-36 bg-white rounded-xl border border-gray-100" />)}
        </div>
      </div>
    );
  }

  if (notFound || !request) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Request not found.</p>
        <Link href="/admin/custom-requests" className="text-indigo-600 hover:underline text-sm mt-2 block">← Back</Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/custom-requests" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-bold text-gray-900">Custom Request</h1>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[request.status] ?? "bg-gray-100 text-gray-600"}`}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </span>
          <span className="text-lg">{TYPE_ICONS[request.requestType] ?? "📋"}</span>
          <span className="text-sm text-gray-500 capitalize">{request.requestType}</span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 text-sm mb-3">Customer Information</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <dt className="text-xs text-gray-500 mb-0.5">Name</dt>
            <dd className="font-medium text-gray-900">{request.fullName}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 mb-0.5">Email</dt>
            <dd className="text-gray-700">{request.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 mb-0.5">Phone</dt>
            <dd className="text-gray-700">
              <a href={`tel:${request.phone}`} className="hover:text-indigo-600 transition-colors">{request.phone}</a>
            </dd>
          </div>
        </dl>
        <div className="mt-3 flex gap-2 flex-wrap">
          <a href={`tel:${request.phone}`}
            className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call
          </a>
          <a href={`https://wa.me/${request.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-green-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>
          <a href={`mailto:${request.email}`}
            className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Email
          </a>
        </div>
      </div>

      {/* Request Details */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 text-sm mb-3">Request Details</h2>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Description</p>
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-3">{request.description}</p>
          </div>
          {request.referenceUrl && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Reference URL</p>
              <a href={request.referenceUrl} target="_blank" rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:underline break-all"
              >
                {request.referenceUrl}
              </a>
            </div>
          )}
          <div className="flex gap-4 text-xs text-gray-400">
            <span>Submitted: {new Date(request.createdAt).toLocaleString("en-EG")}</span>
            {request.updatedAt !== request.createdAt && (
              <span>Updated: {new Date(request.updatedAt).toLocaleString("en-EG")}</span>
            )}
          </div>
        </div>
      </div>

      {/* Update Form */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 text-sm mb-4">Review & Update</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Status</label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((s) => (
                <label key={s.value}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer text-sm font-medium transition-colors ${
                    newStatus === s.value ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <input type="radio" name="status" value={s.value} checked={newStatus === s.value}
                    onChange={() => setNewStatus(s.value)} className="hidden" />
                  {s.label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Admin Notes</label>
            <textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)}
              rows={3} placeholder="Internal notes, quotes, follow-up info..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 resize-none"
            />
          </div>
          {updateMsg && (
            <p className={`text-sm rounded-lg px-3 py-2 ${updateMsg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {updateMsg.text}
            </p>
          )}
          <button type="submit" disabled={updating}
            className="bg-indigo-600 text-white font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {updating ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
