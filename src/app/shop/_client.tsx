"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";

interface Product {
  id: string; name: string; slug: string; shortDescription?: string | null;
  price: number; compareAtPrice?: number | null; stockQty: number;
  productType: string; isFeatured?: boolean;
  category?: { name: string; slug: string } | null;
  images?: { imageUrl: string; altText?: string | null }[];
}
interface Meta { total: number; page: number; limit: number; pages: number }
interface Category { id: string; name: string; slug: string }

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name A–Z" },
];

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-4/5" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="h-8 bg-gray-200 rounded mt-2" />
      </div>
    </div>
  );
}

function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const sort = searchParams.get("sort") ?? "newest";
  const featured = searchParams.get("featured") ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const inStock = searchParams.get("inStock") ?? "";

  const [minPriceInput, setMinPriceInput] = useState(minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice);

  const buildUrl = useCallback((overrides: Record<string, string>) => {
    const params = new URLSearchParams();
    const vals: Record<string, string> = { search, category, sort, featured, page: String(page), minPrice, maxPrice, inStock, ...overrides };
    Object.entries(vals).forEach(([k, v]) => { if (v && v !== "0") params.set(k, v); });
    return `/shop?${params.toString()}`;
  }, [search, category, sort, featured, page, minPrice, maxPrice, inStock]);

  useEffect(() => {
    fetch("/api/storefront/categories", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setCategories(d?.data ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (sort) params.set("sort", sort);
    if (featured) params.set("featured", featured);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (inStock === "true") params.set("inStock", "true");
    params.set("page", String(page));
    params.set("limit", "20");

    fetch(`/api/storefront/products?${params.toString()}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { setProducts(d?.data ?? []); setMeta(d?.meta ?? null); })
      .finally(() => setLoading(false));
  }, [search, category, sort, featured, page, minPrice, maxPrice, inStock]);

  function setParam(key: string, value: string) {
    router.push(buildUrl({ [key]: value, page: "1" }));
  }

  const hasActiveFilters = !!(search || category || minPrice || maxPrice || inStock === "true");

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {search ? `Results for "${search}"` : category ? `${categories.find((c) => c.slug === category)?.name || "Category"}` : "All Products"}
          </h1>
          {meta && <p className="text-sm text-gray-500 mt-0.5">{meta.total} products</p>}
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600 shrink-0">Sort:</label>
          <select
            value={sort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-400 bg-white transition-colors"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden md:block w-52 shrink-0 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Categories</h3>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setParam("category", "")}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${
                    !category ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  All Products
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => setParam("category", cat.slug)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${
                      category === cat.slug ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Price Range</h3>
            <div className="flex gap-2 items-center mb-2">
              <input type="number" min={0} placeholder="Min" value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400 transition-colors"
              />
              <span className="text-gray-400 text-xs shrink-0">–</span>
              <input type="number" min={0} placeholder="Max" value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400 transition-colors"
              />
            </div>
            <button
              onClick={() => router.push(buildUrl({ minPrice: minPriceInput, maxPrice: maxPriceInput, page: "1" }))}
              className="w-full bg-indigo-600 text-white text-xs font-semibold py-1.5 rounded-lg hover:bg-indigo-700 transition-colors active:scale-[0.97]"
            >
              Apply
            </button>
            {(minPrice || maxPrice) && (
              <button
                onClick={() => { setMinPriceInput(""); setMaxPriceInput(""); router.push(buildUrl({ minPrice: "", maxPrice: "", page: "1" })); }}
                className="w-full text-xs text-gray-400 hover:text-gray-600 mt-1 transition-colors"
              >
                Clear price filter
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Availability</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={inStock === "true"}
                onChange={(e) => setParam("inStock", e.target.checked ? "true" : "")}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-600">In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1 min-w-0">
          {/* Mobile category chips */}
          <div className="md:hidden flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            <button
              onClick={() => setParam("category", "")}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                !category ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-600 bg-white"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setParam("category", cat.slug)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  category === cat.slug ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-600 bg-white"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 12 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="font-semibold text-gray-700 mb-1">No products found</p>
              <p className="text-sm text-gray-400 mb-6">Try adjusting your search or filters</p>
              {hasActiveFilters && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => router.push("/shop")}
                    className="inline-block bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-full hover:bg-indigo-700 transition-colors text-sm active:scale-[0.97]"
                  >
                    Clear all filters
                  </button>
                  <Link
                    href="/shop"
                    className="inline-block border border-gray-200 text-gray-600 font-semibold px-6 py-2.5 rounded-full hover:bg-gray-50 transition-colors text-sm"
                  >
                    Browse all products
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>

              {meta && meta.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setParam("page", String(page - 1))}
                    disabled={page <= 1}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors active:scale-[0.97]"
                  >
                    ← Prev
                  </button>
                  <span className="text-sm text-gray-600 px-2">
                    Page {page} of {meta.pages}
                  </span>
                  <button
                    onClick={() => setParam("page", String(page + 1))}
                    disabled={page >= meta.pages}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors active:scale-[0.97]"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPageClient() {
  return (
    <Suspense>
      <ShopPage />
    </Suspense>
  );
}
