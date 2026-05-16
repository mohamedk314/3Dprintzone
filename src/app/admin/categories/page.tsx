"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import CategoryIcon, { CATEGORY_ICON_KEYS, CATEGORY_ICON_LABELS, CategoryIconKey } from "@/components/ui/CategoryIcon";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconKey: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  brand: string;
  createdAt: string;
}

const emptyForm = {
  name: "",
  description: "",
  iconKey: "cube",
  imageUrl: "",
  isActive: true,
  sortOrder: 0,
  brand: "3dprintzone",
};

const BRAND_TABS = [
  { value: "", label: "All Brands" },
  { value: "3dprintzone", label: "3Dprintzone" },
  { value: "rayk", label: "RAYK" },
];

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setUploadError(null);
    setShowCreate(true);
  }

  function startEdit(cat: Category) {
    setShowCreate(false);
    setEditId(cat.id);
    setForm({
      name: cat.name,
      description: cat.description ?? "",
      iconKey: cat.iconKey ?? "cube",
      imageUrl: cat.imageUrl ?? "",
      isActive: cat.isActive,
      sortOrder: cat.sortOrder,
      brand: cat.brand,
    });
    setError(null);
    setUploadError(null);
  }

  function cancelForm() {
    setShowCreate(false);
    setEditId(null);
    setForm(emptyForm);
    setError(null);
    setUploadError(null);
  }

  async function handleImageUpload(file: File) {
    setUploadError(null);
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setUploadError("Only JPG, PNG, or WEBP images are allowed");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setUploadError("Image must be 5 MB or less");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/uploads/r2/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data?.success && data.imageUrl) {
        setForm((f) => ({ ...f, imageUrl: data.imageUrl }));
      } else {
        setUploadError(data?.message || "Upload failed");
      }
    } catch {
      setUploadError("Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function clearImage() {
    setForm((f) => ({ ...f, imageUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const body = {
        ...form,
        description: form.description || null,
        imageUrl: form.brand === "rayk" ? (form.imageUrl || null) : null,
      };
      let res: Response;
      if (editId) {
        res = await fetch(`/api/admin/categories/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
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
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">{categories.length} total</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {BRAND_TABS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setBrandFilter(t.value)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
                  brandFilter === t.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={startCreate}
            className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors press shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
            </svg>
            New Category
          </button>
        </div>
      </div>

      {/* Create / Edit Form */}
      {(showCreate || editId) && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-5">{editId ? "Edit Category" : "New Category"}</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Name *</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Category name"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Brand *</label>
                <select
                  required
                  value={form.brand}
                  onChange={(e) => {
                    const next = e.target.value;
                    setForm((f) => ({
                      ...f,
                      brand: next,
                      // Clear image if switching away from RAYK
                      imageUrl: next === "rayk" ? f.imageUrl : "",
                    }));
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white"
                >
                  <option value="3dprintzone">3Dprintzone</option>
                  <option value="rayk">RAYK</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Sort Order</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                  min={0}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional description"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              />
            </div>

            {/* RAYK-only Category Image upload */}
            {form.brand === "rayk" && (
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/40">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Category Image
                  </label>
                  <span className="text-[11px] text-gray-400">
                    Used on the RAYK landing page category card.
                  </span>
                </div>
                <div className="flex items-start gap-4">
                  <div className="relative w-28 h-28 shrink-0 rounded-lg border border-gray-200 bg-white overflow-hidden flex items-center justify-center">
                    {form.imageUrl ? (
                      <Image
                        src={form.imageUrl}
                        alt="Category preview"
                        fill
                        className="object-contain p-2"
                        sizes="112px"
                      />
                    ) : (
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleImageUpload(f);
                      }}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={uploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:border-indigo-300 hover:text-indigo-700 disabled:opacity-50 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        {uploading ? "Uploading..." : form.imageUrl ? "Replace Image" : "Upload Image"}
                      </button>
                      {form.imageUrl && (
                        <button
                          type="button"
                          onClick={clearImage}
                          className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 px-2 py-1.5"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      PNG, JPG, or WEBP. Max 5 MB. Transparent PNG recommended for best presentation.
                    </p>
                    {uploadError && (
                      <p className="text-xs text-red-600">{uploadError}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Icon picker */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-2 block">Category Icon</label>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                {CATEGORY_ICON_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    title={CATEGORY_ICON_LABELS[key]}
                    onClick={() => setForm((f) => ({ ...f, iconKey: key }))}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                      form.iconKey === key
                        ? "border-indigo-500 bg-indigo-50 shadow-sm"
                        : "border-gray-100 bg-white hover:border-indigo-200 hover:bg-gray-50"
                    }`}
                  >
                    <CategoryIcon
                      iconKey={key}
                      className={`w-5 h-5 ${form.iconKey === key ? "text-indigo-600" : "text-gray-500"}`}
                    />
                    <span className={`text-[9px] leading-tight font-medium ${form.iconKey === key ? "text-indigo-600" : "text-gray-400"}`}>
                      {CATEGORY_ICON_LABELS[key as CategoryIconKey]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="accent-indigo-600"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">Active (visible in storefront)</label>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Saving..." : editId ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={cancelForm}
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
          <div className="p-6 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="p-10 sm:p-14 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">No categories yet</p>
            <p className="text-xs text-gray-500 mb-5">Organize products by creating categories.</p>
            <button onClick={startCreate}
              className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors press">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
              </svg>
              New Category
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Brand</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Image / Icon</th>
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
                    {cat.description && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{cat.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      cat.brand === "rayk" ? "bg-gray-900 text-white" : "bg-indigo-100 text-indigo-700"
                    }`}>
                      {cat.brand === "rayk" ? "RAYK" : "3DPZ"}
                    </span>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    {cat.brand === "rayk" && cat.imageUrl ? (
                      <div className="relative w-10 h-10 rounded-lg border border-gray-200 bg-white overflow-hidden">
                        <Image src={cat.imageUrl} alt={cat.name} fill className="object-contain p-1" sizes="40px" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                        <CategoryIcon iconKey={cat.iconKey} className="w-4 h-4 text-indigo-600" />
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3 font-mono text-gray-500 text-xs hidden sm:table-cell">{cat.slug}</td>
                  <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{cat.sortOrder}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      cat.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => startEdit(cat)}
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
