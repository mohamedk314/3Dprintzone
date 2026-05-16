"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  price: number;
  stockQty: number;
  productType: string;
  isActive: boolean;
  isFeatured: boolean;
  forceShippingDiscussion: boolean;
  brand: string;
  category: { name: string } | null;
  images: { imageUrl: string }[];
  createdAt: string;
}

const BRAND_TABS = [
  { value: "", label: "All Brands" },
  { value: "3dprintzone", label: "3Dprintzone" },
  { value: "rayk", label: "RAYK" },
];

interface Meta { total: number; page: number; pages: number }

const STATUS_BADGE = {
  true:  "bg-green-100 text-green-700",
  false: "bg-gray-100 text-gray-500",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [brand, setBrand] = useState("");

  async function fetchProducts(p: number, s: string, b: string) {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: "20" });
    if (s) params.set("search", s);
    if (b) params.set("brand", b);
    const res = await fetch(`/api/admin/products?${params}`);
    const data = await res.json();
    setProducts(data?.data ?? []);
    setMeta(data?.meta ?? null);
    setLoading(false);
  }

  useEffect(() => { fetchProducts(page, search, brand); }, [page, search, brand]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  function handleBrandChange(b: string) {
    setBrand(b);
    setPage(1);
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    fetchProducts(page, search, brand);
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Products</h1>
          {meta ? (
            <p className="text-sm text-gray-500 mt-0.5">{meta.total} total</p>
          ) : (
            <p className="text-sm text-gray-300 mt-0.5">Loading…</p>
          )}
        </div>
        <Link href="/admin/products/new"
          className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shrink-0 press shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
          </svg>
          New Product
        </Link>
      </div>

      {/* Brand Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {BRAND_TABS.map((t) => (
          <button key={t.value} type="button" onClick={() => handleBrandChange(t.value)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${brand === t.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name, SKU..."
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 bg-white"
        />
        <button type="submit" className="border border-gray-200 bg-white text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          Search
        </button>
        {search && (
          <button type="button" onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }}
            className="text-sm text-gray-500 hover:text-gray-700 px-2"
          >
            Clear
          </button>
        )}
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-10 sm:p-14 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">
              {search ? "No products match your search" : "No products yet"}
            </p>
            <p className="text-xs text-gray-500 mb-5">
              {search ? "Try a different keyword or clear the search." : "Add your first product to start selling."}
            </p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors press"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
              </svg>
              New Product
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Brand</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {p.images[0]?.imageUrl ? (
                            <img src={p.images[0].imageUrl} alt={p.name} className="w-9 h-9 rounded-lg object-cover border border-gray-100 shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center text-gray-300">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 truncate max-w-[180px]">{p.name}</p>
                            {p.sku && <p className="text-xs text-gray-400 font-mono">{p.sku}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 hidden lg:table-cell">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.brand === "rayk" ? "bg-gray-900 text-white" : "bg-indigo-100 text-indigo-700"}`}>
                          {p.brand === "rayk" ? "RAYK" : "3DPZ"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{p.category?.name ?? "—"}</td>
                      <td className="px-5 py-3 font-medium text-gray-900">{Number(p.price).toFixed(0)} EGP</td>
                      <td className="px-5 py-3">
                        {p.productType === "physical" ? (
                          <span className={`text-xs font-medium ${p.stockQty === 0 ? "text-red-600" : p.stockQty <= 5 ? "text-amber-600" : "text-gray-700"}`}>
                            {p.stockQty}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 capitalize">{p.productType}</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[String(p.isActive) as "true" | "false"]}`}>
                            {p.isActive ? "Active" : "Inactive"}
                          </span>
                          {p.isFeatured && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">Featured</span>
                          )}
                          {p.forceShippingDiscussion && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Ship TBD</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/products/${p.id}`}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => toggleActive(p.id, p.isActive)}
                            className={`text-xs font-medium px-2 py-1 rounded transition-colors ${p.isActive ? "text-amber-600 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`}
                          >
                            {p.isActive ? "Disable" : "Enable"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && meta.pages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">Page {meta.page} of {meta.pages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1}
                    className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    ← Prev
                  </button>
                  <button onClick={() => setPage((p) => p + 1)} disabled={page >= meta.pages}
                    className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
