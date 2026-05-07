"use client";

import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  brand: string;
  createdAt: string;
}

const emptyForm = { name: "", description: "", isActive: true, sortOrder: 0, brand: "3dprintzone" };

const BRAND_TABS = [
  { value: "", label: "All Brands" },
  { value: "3dprintzone", label: "3Dprintzone" },
  { value: "rayk", label: "RAYK" },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [brandFilter, setBrandFilter] = useState("");

  async function fetchCategories(b?: string) {
    const params = new URLSearchParams();
    if (b) params.set("brand", b);
    const res = await fetch(`/api/admin/categories?${params}`);
    const data = await res.json();
    setCategories(data?.data ?? []);
  }

  useEffect(() => { fetchCategories(brandFilter).finally(() => setLoading(false)); }, [brandFilter]);

  function startCreate() {
    setEditId(null);
    setForm(emptyForm);
    setError(null);
    setShowCreate(true);
  }

  function startEdit(cat: Category) {
    setShowCreate(false);
    setEditId(cat.id);
    setForm({ name: cat.name, description: cat.description ?? "", isActive: cat.isActive, sortOrder: cat.sortOrder, brand: cat.brand });
    setError(null);
  }

  function cancelForm() {
    setShowCreate(false);
    setEditId(null);
    setForm(emptyForm);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const body = { ...form, description: form.description || null };
      let res: Response;
      if (editId) {
        res = await fetch(`/api/admin/categories/${editId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      } else {
        res = await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      }
      const data = await res.json();
      if (data.success) {
        await fetchCategories(brandFilter);
        cancelForm();
      } else {
        setError(data.message || "Error saving category");
      }
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleteId(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) await fetchCategories(brandFilter);
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">{categories.length} total</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {BRAND_TABS.map((t) => (
              <button key={t.value} type="button" onClick={() => setBrandFilter(t.value)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${brandFilter === t.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button onClick={startCreate}
          className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Category
        </button>
        </div>
      </div>

      {/* Create / Edit Form */}
      {(showCreate || editId) && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">{editId ? "Edit Category" : "New Category"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Name *</label>
                <input required type="text" value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Category name"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Brand *</label>
                <select required value={form.brand}
                  onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white"
                >
                  <option value="3dprintzone">3Dprintzone</option>
                  <option value="rayk">RAYK</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Sort Order</label>
                <input type="number" value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                  min={0}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Description</label>
              <input type="text" value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional description"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="accent-indigo-600"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">Active (visible in storefront)</label>
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={submitting}
                className="bg-indigo-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Saving..." : editId ? "Update" : "Create"}
              </button>
              <button type="button" onClick={cancelForm}
                className="border border-gray-200 text-gray-700 text-sm font-medium px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-sm mb-3">No categories yet.</p>
            <button onClick={startCreate} className="text-indigo-600 text-sm hover:underline">Create your first category →</button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Brand</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Slug</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Sort</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((cat) => (
                <tr key={cat.id} className={`hover:bg-gray-50 transition-colors ${editId === cat.id ? "bg-indigo-50" : ""}`}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{cat.name}</p>
                    {cat.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{cat.description}</p>}
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cat.brand === "rayk" ? "bg-gray-900 text-white" : "bg-indigo-100 text-indigo-700"}`}>
                      {cat.brand === "rayk" ? "RAYK" : "3DPZ"}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-gray-500 text-xs hidden sm:table-cell">{cat.slug}</td>
                  <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{cat.sortOrder}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cat.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => startEdit(cat)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                      >
                        Edit
                      </button>
                      {cat.isActive && (
                        <button
                          onClick={() => { if (confirm(`Deactivate "${cat.name}"?`)) handleDelete(cat.id); }}
                          disabled={deleteId === cat.id}
                          className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {deleteId === cat.id ? "..." : "Deactivate"}
                        </button>
                      )}
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
