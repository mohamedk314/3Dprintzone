"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ShippingMethod {
  id: string;
  name: string;
  description: string | null;
  price: number;
  estimatedDays: number;
  isActive: boolean;
  brand: string;
}

const BRAND_OPTIONS = [
  { value: "both", label: "Both brands" },
  { value: "3dprintzone", label: "3Dprintzone only" },
  { value: "rayk", label: "RAYK only" },
];

const emptyForm = { name: "", description: "", price: "0", estimatedDays: "3", isActive: true, brand: "both" };

export default function AdminShippingMethodsPage() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/shipping/methods");
    const data = await res.json();
    setMethods(data.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function flash(text: string, ok: boolean) {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3500);
  }

  function startNew() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(method: ShippingMethod) {
    setForm({
      name: method.name,
      description: method.description ?? "",
      price: String(method.price),
      estimatedDays: String(method.estimatedDays),
      isActive: method.isActive,
      brand: method.brand,
    });
    setEditingId(method.id);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        name: form.name,
        description: form.description || null,
        price: Number(form.price),
        estimatedDays: Number(form.estimatedDays),
        isActive: form.isActive,
        brand: form.brand,
      };
      const url = editingId ? `/api/admin/shipping/methods/${editingId}` : "/api/admin/shipping/methods";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) {
        flash(editingId ? "Method updated." : "Method created.", true);
        cancelForm();
        load();
      } else {
        flash(data.message || "Save failed.", false);
      }
    } catch {
      flash("Network error.", false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this shipping method?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/shipping/methods/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { flash("Method deleted.", true); load(); }
      else flash(data.message || "Delete failed.", false);
    } catch {
      flash("Network error.", false);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl space-y-5">
      {/* Header / Action bar */}
      <div className="bg-white rounded-xl border border-gray-100 px-4 sm:px-5 py-4 flex items-center gap-3 sm:gap-4 flex-wrap shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Shipping Methods</h1>
          </div>
          <p className="text-xs text-gray-500 sm:ml-10">Define delivery methods like Standard, Express, Pickup.</p>
        </div>
        <div className="flex gap-2 items-center ml-auto">
          <Link
            href="/admin/shipping/zones"
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors press"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Zones
          </Link>
          <button
            onClick={startNew}
            className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors press shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
            </svg>
            New Shipping Method
          </button>
        </div>
      </div>

      {msg && (
        <div
          className={`text-sm rounded-lg px-4 py-2.5 border anim-fade-slide-in ${
            msg.ok
              ? "bg-green-50 text-green-700 border-green-100"
              : "bg-red-50 text-red-700 border-red-100"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSave} className="bg-white border border-indigo-100 rounded-xl p-5 space-y-4 anim-fade-slide-in">
          <h2 className="font-semibold text-gray-900 text-sm">{editingId ? "Edit Method" : "New Method"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Method Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Standard Delivery"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Additional Price (EGP) *</label>
              <input required type="number" min="0" step="0.01" value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Delivered within 3–5 business days"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Estimated Days</label>
              <input type="number" min="1" value={form.estimatedDays}
                onChange={(e) => setForm({ ...form, estimatedDays: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Brand</label>
              <select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-white">
                {BRAND_OPTIONS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="accent-indigo-600" />
            <span className="text-sm text-gray-700">Active</span>
          </label>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving}
              className="bg-indigo-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors press">
              {saving ? "Saving..." : editingId ? "Update Method" : "Create Method"}
            </button>
            <button type="button" onClick={cancelForm}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors press">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : methods.length === 0 ? (
          <div className="p-10 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">No shipping methods yet</p>
            <p className="text-xs text-gray-500 mb-4">Create your first method to make it available at checkout.</p>
            <button
              onClick={startNew}
              className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors press"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
              </svg>
              New Shipping Method
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Method</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Description</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Price</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">Days</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">Brand</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {methods.map((method) => (
                <tr key={method.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-medium text-gray-900">{method.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate hidden md:table-cell">{method.description ?? "—"}</td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-900">{Number(method.price).toFixed(0)} EGP</td>
                  <td className="px-4 py-3 text-center text-gray-600 hidden sm:table-cell">{method.estimatedDays} days</td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{method.brand}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${method.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {method.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => startEdit(method)}
                        className="text-xs text-indigo-600 hover:underline font-medium">Edit</button>
                      <button onClick={() => handleDelete(method.id)} disabled={deleting === method.id}
                        className="text-xs text-red-500 hover:underline font-medium disabled:opacity-50">
                        {deleting === method.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
