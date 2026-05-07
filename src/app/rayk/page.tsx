"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import RaykProductCard from "@/components/rayk/RaykProductCard";

interface Category { id: string; name: string; slug: string; _count?: { products: number } }
interface Product {
  id: string; name: string; slug: string;
  price: number; compareAtPrice?: number | null;
  stockQty: number; productType: string; isFeatured?: boolean;
  images?: { imageUrl: string; altText?: string | null }[];
}

export default function RaykHomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/storefront/categories?brand=rayk", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/storefront/products?brand=rayk&featured=true&limit=8", { credentials: "include" }).then((r) => r.json()),
    ]).then(([catData, prodData]) => {
      setCategories(catData?.data ?? []);
      setFeatured(prodData?.data ?? []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-24 md:py-36 flex flex-col items-center text-center">
          <div className="relative w-72 h-40 sm:w-[26rem] sm:h-56 md:w-[40rem] md:h-72 mb-8">
            <Image
              src="/brands/rayk-logo.png"
              alt="RAYK"
              fill
              priority
              className="object-contain"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>
          <p className="text-white/60 text-sm md:text-base max-w-xs mx-auto mb-10 tracking-[0.15em] lowercase">
            your 3d printed gifts
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/rayk/shop"
              className="border border-white text-white font-semibold tracking-widest uppercase text-xs px-10 py-3.5 hover:bg-white hover:text-black transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16 space-y-20">
        {/* Categories */}
        {categories.length > 0 && (
          <section>
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="text-xs font-semibold tracking-[0.3em] uppercase text-black/50">Shop by Category</h2>
              <Link href="/rayk/shop" className="text-xs tracking-widest uppercase text-black hover:underline underline-offset-4">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-px bg-black/5">
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/rayk/category/${cat.slug}`}
                  className="group bg-white p-6 text-center hover:bg-black hover:text-white transition-colors"
                >
                  <p className="text-xs font-semibold tracking-widest uppercase text-inherit leading-tight">{cat.name}</p>
                  {cat._count && (
                    <p className="text-[10px] text-black/30 group-hover:text-white/40 mt-1 transition-colors">{cat._count.products}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured Products */}
        {(loading || featured.length > 0) && (
          <section>
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="text-xs font-semibold tracking-[0.3em] uppercase text-black/50">Featured</h2>
              <Link href="/rayk/shop" className="text-xs tracking-widest uppercase text-black hover:underline underline-offset-4">
                View All
              </Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-gray-100" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {featured.map((p) => <RaykProductCard key={p.id} product={p} />)}
              </div>
            )}
          </section>
        )}

        {/* Empty state */}
        {!loading && categories.length === 0 && featured.length === 0 && (
          <section className="py-20 text-center">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/30 mb-4">Coming Soon</p>
            <h2 className="text-3xl font-bold tracking-tight mb-4">RAYK is launching soon.</h2>
            <p className="text-black/40 text-sm tracking-wide">Check back soon for new arrivals.</p>
          </section>
        )}
      </div>
    </div>
  );
}
