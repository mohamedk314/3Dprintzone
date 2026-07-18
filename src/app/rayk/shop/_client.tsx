"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import RaykProductCard from "@/components/rayk/RaykProductCard";

interface Product {
  id: string; name: string; slug: string;
  price: number; compareAtPrice?: number | null;
  stockQty: number; productType: string;
  category?: { name: string; slug: string } | null;
  images?: { imageUrl: string; altText?: string | null }[];
}
interface Category { id: string; name: string; slug: string }
interface Meta { total: number; page: number; pages: number }

function RaykProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-gray-100" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-8 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

function RaykShopInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);

  const search   = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const sort     = searchParams.get("sort") ?? "newest";
  const page     = Number(searchParams.get("page") ?? "1");
  const [searchInput, setSearchInput] = useState(search);

  function setParam(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value); else p.delete(key);
    p.set("page", "1");
    router.push(`/rayk/shop?${p.toString()}`);
  }

  useEffect(() => {
    fetch("/api/storefront/categories?brand=rayk", { credentials: "include" })
      .then((r) => r.json()).then((d) => setCategories(d?.data ?? []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams({ brand: "rayk", page: String(page), limit: "20", sort });
    if (search) p.set("search", search);
    if (category) p.set("category", category);
    fetch(`/api/storefront/products?${p.toString()}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { setProducts(d?.data ?? []); setMeta(d?.meta ?? null); })
      .finally(() => setLoading(false));
  }, [search, category, sort, page]);

  const hasActiveFilters = !!(search || category);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight">Shop</h1>
        {meta && <p className="text-xs text-black/40 tracking-widest uppercase mt-1">{meta.total} products</p>}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="md:w-48 shrink-0 space-y-6">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-black/30 mb-3">Category</p>
            <ul className="space-y-1 text-sm">
              <li>
                <button onClick={() => setParam("category", "")}
                  className={`text-left w-full tracking-wide py-1 transition-colors ${!category ? "font-semibold text-black" : "text-black/50 hover:text-black"}`}
                >
                  All
                </button>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <button onClick={() => setParam("category", c.slug)}
                    className={`text-left w-full tracking-wide py-1 transition-colors ${category === c.slug ? "font-semibold text-black" : "text-black/50 hover:text-black"}`}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-black/30 mb-3">Sort</p>
            <ul className="space-y-1 text-sm">
              {[
                { value: "newest", label: "Newest" },
                { value: "price_asc", label: "Price: Low–High" },
                { value: "price_desc", label: "Price: High–Low" },
              ].map((s) => (
                <li key={s.value}>
                  <button onClick={() => setParam("sort", s.value)}
                    className={`text-left w-full tracking-wide py-1 transition-colors ${sort === s.value ? "font-semibold text-black" : "text-black/50 hover:text-black"}`}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0">
          <form onSubmit={(e) => { e.preventDefault(); setParam("search", searchInput); }} className="flex gap-2 mb-6">
            <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
              className="flex-1 border border-black/20 px-3 py-2 text-sm focus:outline-none focus:border-black tracking-wide transition-colors"
            />
            <button type="submit" className="border border-black px-5 py-2 text-xs font-semibold tracking-widest uppercase hover:bg-black hover:text-white transition-colors active:scale-[0.97]">
              Search
            </button>
            {search && (
              <button type="button" onClick={() => { setSearchInput(""); setParam("search", ""); }}
                className="text-xs text-black/40 hover:text-black px-2 transition-colors">Clear</button>
            )}
          </form>

          {/* Mobile category chips */}
          {categories.length > 0 && (
            <div className="md:hidden flex gap-2 overflow-x-auto pb-2 mb-4">
              <button
                onClick={() => setParam("category", "")}
                className={`shrink-0 px-3 py-1.5 text-xs font-semibold tracking-widest uppercase border transition-colors ${!category ? "bg-black text-white border-black" : "border-black/20 text-black/50"}`}
              >
                All
              </button>
              {categories.map((c) => (
                <button key={c.id}
                  onClick={() => setParam("category", c.slug)}
                  className={`shrink-0 px-3 py-1.5 text-xs font-semibold tracking-widest uppercase border transition-colors ${category === c.slug ? "bg-black text-white border-black" : "border-black/20 text-black/50"}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => <RaykProductSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center border border-black/5">
              <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/20 mb-2">No results</p>
              <p className="text-sm text-black/40 mb-8 tracking-wide">
                {hasActiveFilters ? "Try a different search or category" : "No products available yet"}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={() => { setSearchInput(""); router.push("/rayk/shop"); }}
                  className="text-xs font-semibold tracking-widest uppercase text-black border border-black px-8 py-3 hover:bg-black hover:text-white transition-colors"
                >
                  Clear filters
                </button>
              )}
              {!hasActiveFilters && (
                <Link href="/rayk" className="text-xs font-semibold tracking-widest uppercase text-black hover:underline underline-offset-4">
                  Back to Home
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((p) => <RaykProductCard key={p.id} product={p} />)}
              </div>
              {meta && meta.pages > 1 && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-black/5">
                  <p className="text-xs text-black/30 tracking-widest uppercase">Page {meta.page} of {meta.pages}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setParam("page", String(page - 1))} disabled={page <= 1}
                      className="border border-black/20 px-4 py-2 text-xs tracking-widest uppercase disabled:opacity-30 hover:bg-black hover:text-white hover:border-black transition-colors active:scale-[0.97]"
                    >
                      Prev
                    </button>
                    <button onClick={() => setParam("page", String(page + 1))} disabled={page >= meta.pages}
                      className="border border-black/20 px-4 py-2 text-xs tracking-widest uppercase disabled:opacity-30 hover:bg-black hover:text-white hover:border-black transition-colors active:scale-[0.97]"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RaykShopPage() {
  return <Suspense><RaykShopInner /></Suspense>;
}
