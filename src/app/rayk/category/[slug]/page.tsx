"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import RaykProductCard from "@/components/rayk/RaykProductCard";

interface Product {
  id: string; name: string; slug: string;
  price: number; compareAtPrice?: number | null;
  stockQty: number; productType: string;
  images?: { imageUrl: string; altText?: string | null }[];
}

export default function RaykCategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [name, setName] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/storefront/categories/${slug}?brand=rayk`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setName(d.data.name);
          setProducts(d.data.products ?? []);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link href="/rayk/shop" className="text-[10px] font-semibold tracking-[0.3em] uppercase text-black/30 hover:text-black transition-colors">
          ← Shop
        </Link>
        {name && <h1 className="text-2xl font-bold tracking-tight mt-2">{name}</h1>}
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
      ) : products.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/20 mb-3">Empty</p>
          <p className="text-sm text-black/40">No products in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map((p) => <RaykProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
