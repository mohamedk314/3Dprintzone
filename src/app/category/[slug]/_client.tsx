"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";

interface Category { id: string; name: string; slug: string; description?: string | null }
interface Product {
  id: string; name: string; slug: string; shortDescription?: string | null;
  price: number; compareAtPrice?: number | null; stockQty: number;
  productType: string; isFeatured?: boolean;
  category?: { name: string; slug: string } | null;
  images?: { imageUrl: string; altText?: string | null }[];
}
interface Meta { total: number; page: number; limit: number; pages: number }

export default function CategoryPageClient() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetch(`/api/storefront/categories/${slug}`, { credentials: "include" })
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        setCategory(d?.data?.category ?? null);
        setProducts(d?.data?.products ?? []);
        setMeta(d?.data?.meta ?? null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (page === 1) return;
    fetch(`/api/storefront/products?category=${slug}&page=${page}&limit=20`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setProducts((prev) => [...prev, ...(d?.data ?? [])]);
        setMeta(d?.meta ?? null);
      });
  }, [page, slug]);

  if (notFound) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h1>
        <Link href="/shop" className="text-indigo-600 hover:underline">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-indigo-600">Shop</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{category?.name ?? slug}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-7 bg-gray-200 rounded w-48 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-72" />
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-900">{category?.name}</h1>
            {category?.description && (
              <p className="text-gray-500 mt-2">{category.description}</p>
            )}
            {meta && <p className="text-sm text-gray-400 mt-1">{meta.total} products</p>}
          </>
        )}
      </div>

      {/* Products */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-4/5" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
                <div className="h-8 bg-gray-200 rounded mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="font-medium">No products in this category yet</p>
          <Link href="/shop" className="text-indigo-600 hover:underline text-sm mt-2 block">
            Browse all products
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          {meta && page < meta.pages && (
            <div className="text-center mt-8">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="bg-white border border-gray-200 text-gray-700 font-medium px-8 py-2.5 rounded-full hover:bg-gray-50 transition-colors"
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
