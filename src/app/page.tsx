"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";

interface Category { id: string; name: string; slug: string; description?: string | null; _count?: { products: number } }
interface Product {
  id: string; name: string; slug: string; shortDescription?: string | null;
  price: number; compareAtPrice?: number | null; stockQty: number;
  productType: string; isFeatured?: boolean;
  category?: { name: string; slug: string } | null;
  images?: { imageUrl: string; altText?: string | null }[];
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/storefront/categories", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/storefront/products?featured=true&limit=8", { credentials: "include" }).then((r) => r.json()),
    ]).then(([catData, prodData]) => {
      setCategories(catData?.data ?? []);
      setFeatured(prodData?.data ?? []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
              Premium 3D Printing in Egypt
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              Bring Your Ideas<br />
              <span className="text-orange-300">to Life in 3D</span>
            </h1>
            <p className="text-indigo-100 text-lg mb-8 max-w-lg">
              Shop ready-made 3D printed products or request a fully custom design. Fast delivery across Egypt.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Link
                href="/shop"
                className="bg-white text-indigo-700 font-bold px-8 py-3 rounded-full hover:bg-indigo-50 transition-colors text-center"
              >
                Shop Now
              </Link>
              <Link
                href="/custom-request"
                className="border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white/10 transition-colors text-center"
              >
                Custom Request
              </Link>
            </div>
          </div>
          <div className="flex-shrink-0 hidden md:flex items-center justify-center w-64 h-64 bg-white/10 rounded-3xl backdrop-blur">
            <svg className="w-32 h-32 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
            </svg>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            {[
              { icon: "🚚", label: "Fast Delivery", sub: "Across Egypt" },
              { icon: "✅", label: "Quality Guaranteed", sub: "Precision printing" },
              { icon: "💳", label: "Easy Payment", sub: "COD & InstaPay" },
              { icon: "🎨", label: "Custom Designs", sub: "Any size or shape" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <span className="text-2xl">{b.icon}</span>
                <div>
                  <div className="font-semibold text-gray-900 text-xs">{b.label}</div>
                  <div className="text-gray-500 text-xs">{b.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        {/* Categories */}
        {categories.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
              <Link href="/shop" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {categories.slice(0, 10).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="group bg-white border border-gray-100 rounded-xl p-4 text-center hover:border-indigo-200 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-indigo-100 transition-colors">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                    </svg>
                  </div>
                  <div className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors leading-tight">
                    {cat.name}
                  </div>
                  {cat._count && (
                    <div className="text-xs text-gray-400 mt-0.5">{cat._count.products} products</div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured Products */}
        {(loading || featured.length > 0) && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
              <Link href="/shop?featured=true" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                View all →
              </Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 rounded w-4/5" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                      <div className="h-8 bg-gray-200 rounded mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {featured.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </section>
        )}

        {/* Custom Request CTA */}
        <section className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Need a Custom 3D Print?</h2>
          <p className="text-orange-100 mb-6 max-w-xl mx-auto">
            Send us your design or describe what you need. We handle architecture models, gifts, dental, and mechanical parts.
          </p>
          <Link
            href="/custom-request"
            className="inline-block bg-white text-orange-600 font-bold px-8 py-3 rounded-full hover:bg-orange-50 transition-colors"
          >
            Submit a Request
          </Link>
        </section>
      </div>
    </div>
  );
}
