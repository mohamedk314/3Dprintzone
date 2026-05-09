"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RaykProductCard from "@/components/rayk/RaykProductCard";

interface WishlistItem {
  id: string;
  product: {
    id: string; name: string; slug: string;
    price: number; compareAtPrice?: number | null;
    stockQty: number; productType: string;
    images: { imageUrl: string; altText?: string | null }[];
  };
}

function RaykWishlistSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-7 bg-gray-100 rounded w-32 mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[3/4] bg-gray-100" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
              <div className="h-8 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RaykWishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchWishlist() {
    const res = await fetch("/api/storefront/wishlist?brand=rayk", { credentials: "include" });
    const data = await res.json();
    setItems(data?.data?.items ?? []);
  }

  useEffect(() => { fetchWishlist().finally(() => setLoading(false)); }, []);

  async function removeItem(productId: string) {
    await fetch(`/api/storefront/wishlist/${productId}?brand=rayk`, { method: "DELETE", credentials: "include" });
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
    window.dispatchEvent(new Event("rayk-wishlist-updated"));
  }

  if (loading) return <RaykWishlistSkeleton />;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 border border-black/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-7 h-7 text-black/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/20 mb-2">Your wishlist is empty</p>
        <p className="text-sm text-black/40 mb-8 tracking-wide">Save pieces you love</p>
        <Link href="/rayk/shop" className="text-xs font-semibold tracking-widest uppercase text-black border border-black px-10 py-3 hover:bg-black hover:text-white transition-colors duration-150">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8 flex items-baseline justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Wishlist</h1>
        <p className="text-xs text-black/30 tracking-widest uppercase">{items.length} item{items.length !== 1 ? "s" : ""}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.id} className="relative">
            <RaykProductCard product={item.product} />
            <button
              onClick={() => removeItem(item.product.id)}
              className="absolute top-2 right-2 w-7 h-7 bg-white border border-black/10 flex items-center justify-center text-black/30 hover:text-black hover:border-black transition-all duration-150 hover:scale-110 active:scale-95 text-xs"
              title="Remove from wishlist"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
