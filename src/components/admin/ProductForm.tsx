"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Category { id: string; name: string }

export interface ProductFormValues {
  name: string;
  categoryId: string;
  shortDescription: string;
  description: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  stockQty: string;
  lowStockThreshold: string;
  productType: "physical" | "digital" | "service";
  isActive: boolean;
  isFeatured: boolean;
}

interface ProductFormProps {
  mode: "create" | "edit";
  productId?: string;
  initialValues?: Partial<ProductFormValues>;
}

const defaultValues: ProductFormValues = {
  name: "", categoryId: "", shortDescription: "", description: "",
  sku: "", price: "", compareAtPrice: "", stockQty: "0",
  lowStockThreshold: "3", productType: "physical", isActive: true, isFeatured: false,
};

export default function ProductForm({ mode, productId, initialValues }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductFormValues>({ ...defaultValues, ...initialValues });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/categories").then((r) => r.json()).then((d) => setCategories(d?.data ?? []));
  }, []);

  useEffect(() => {
    if (initialValues) setForm({ ...defaultValues, ...initialValues });
  }, [initialValues]);

  function setField<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const body = {
        name: form.name,
        categoryId: form.categoryId,
        shortDescription: form.shortDescription || null,
        description: form.description || null,
        sku: form.sku || null,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
        stockQty: Number(form.stockQty),
        lowStockThreshold: Number(form.lowStockThreshold),
        productType: form.productType,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
      };

      const res = mode === "create"
        ? await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await fetch(`/api/admin/products/${productId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

      const data = await res.json();
      if (data.success) {
        router.push("/admin/products");
        router.refresh();
      } else {
        setError(data.message || "Error saving product");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50";
  const labelCls = "text-xs font-medium text-gray-700 mb-1 block";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-4 text-sm">Basic Information</h2>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Name *</label>
            <input required type="text" value={form.name} onChange={(e) => setField("name", e.target.value)}
              placeholder="Product name" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Category *</label>
            <select required value={form.categoryId} onChange={(e) => setField("categoryId", e.target.value)}
              className={inputCls + " bg-white"}
            >
              <option value="">Select category...</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Short Description</label>
            <input type="text" value={form.shortDescription} onChange={(e) => setField("shortDescription", e.target.value)}
              placeholder="Brief product summary" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Full Description</label>
            <textarea value={form.description} onChange={(e) => setField("description", e.target.value)}
              placeholder="Detailed product description..." rows={4} className={inputCls + " resize-none"} />
          </div>
          <div>
            <label className={labelCls}>SKU</label>
            <input type="text" value={form.sku} onChange={(e) => setField("sku", e.target.value)}
              placeholder="Stock Keeping Unit (optional)" className={inputCls} />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-4 text-sm">Pricing</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Price (EGP) *</label>
            <input required type="number" min={0} step="0.01" value={form.price}
              onChange={(e) => setField("price", e.target.value)}
              placeholder="0.00" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Compare At Price (EGP)</label>
            <input type="number" min={0} step="0.01" value={form.compareAtPrice}
              onChange={(e) => setField("compareAtPrice", e.target.value)}
              placeholder="Original price (optional)" className={inputCls} />
          </div>
        </div>
      </div>

      {/* Inventory */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-4 text-sm">Inventory & Type</h2>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Product Type *</label>
            <select value={form.productType} onChange={(e) => setField("productType", e.target.value as ProductFormValues["productType"])}
              className={inputCls + " bg-white"}
            >
              <option value="physical">Physical</option>
              <option value="digital">Digital</option>
              <option value="service">Service</option>
            </select>
          </div>
          {form.productType === "physical" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Stock Quantity</label>
                <input type="number" min={0} value={form.stockQty}
                  onChange={(e) => setField("stockQty", e.target.value)}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Low Stock Threshold</label>
                <input type="number" min={0} value={form.lowStockThreshold}
                  onChange={(e) => setField("lowStockThreshold", e.target.value)}
                  className={inputCls} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visibility */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-4 text-sm">Visibility</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isActive}
              onChange={(e) => setField("isActive", e.target.checked)}
              className="w-4 h-4 accent-indigo-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Active</p>
              <p className="text-xs text-gray-500">Product is visible in the storefront</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isFeatured}
              onChange={(e) => setField("isFeatured", e.target.checked)}
              className="w-4 h-4 accent-indigo-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Featured</p>
              <p className="text-xs text-gray-500">Show on homepage featured section</p>
            </div>
          </label>
        </div>
      </div>

      {/* Images notice for create mode */}
      {mode === "create" && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">
          <strong>Images:</strong> Save the product first, then upload images from the product edit page.
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={submitting}
          className="bg-indigo-600 text-white font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? "Saving..." : mode === "create" ? "Create Product" : "Update Product"}
        </button>
        <button type="button" onClick={() => router.push("/admin/products")}
          className="border border-gray-200 text-gray-700 text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
