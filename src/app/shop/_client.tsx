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
              className="press w-full bg-indigo-600 text-white text-xs font-semibold py-2 rounded-lg hover:bg-indigo-700 transition-[background-color,transform]"
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
          <div className="md:hidden flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide -mx-1 px-1">
            <button
              onClick={() => setParam("category", "")}
              className={`press shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-[background-color,color,border-color,transform] ${
                !category
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "border-gray-200 text-gray-600 bg-white hover:border-gray-300"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setParam("category", cat.slug)}
                className={`press shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-[background-color,color,border-color,transform] ${
                  category === cat.slug
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "border-gray-200 text-gray-600 bg-white hover:border-gray-300"
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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-14 px-6 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 mb-3">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="font-semibold text-gray-900 text-base mb-1">
                {hasActiveFilters ? "No products match your filters" : "No products yet"}
              </p>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                {hasActiveFilters
                  ? "Try a different keyword, category, or price range."
                  : "Check back soon — new products are added regularly. Or request a custom print made just for you."}
              </p>
              {hasActiveFilters ? (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => router.push("/shop")}
                    className="press inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-full hover:bg-indigo-700 transition-[background-color,transform] text-sm"
                  >
                    Clear all filters
                  </button>
                  <Link
                    href="/shop"
                    className="press inline-flex items-center justify-center border border-gray-200 text-gray-600 font-semibold px-6 py-2.5 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-[background-color,border-color,transform] text-sm"
                  >
                    Browse all products
                  </Link>
                </div>
              ) : (
                <Link
                  href="/custom-request"
                  className="press inline-flex items-center gap-1.5 bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-full hover:bg-indigo-700 transition-[background-color,transform] text-sm"
                >
                  Submit a Custom Request
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
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
                    className="press px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-[background-color,border-color,transform]"
                  >
                    ← Prev
                  </button>
                  <span className="text-sm text-gray-600 px-2 tabular-nums">
                    Page {page} of {meta.pages}
                  </span>
                  <button
                    onClick={() => setParam("page", String(page + 1))}
                    disabled={page >= meta.pages}
                    className="press px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-[background-color,border-color,transform]"
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
