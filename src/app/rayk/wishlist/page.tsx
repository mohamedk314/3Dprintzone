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

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm text-black/30 tracking-widest uppercase">Loading...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/20 mb-4">Your wishlist is empty</p>
        <Link href="/rayk/shop" className="text-sm font-semibold tracking-widest uppercase text-black hover:underline underline-offset-4">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8 flex items-baseline justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Wishlist</h1>
        <p className="text-xs text-black/30 tracking-widest uppercase">{items.length} items</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.id} className="relative">
            <RaykProductCard product={item.product} />
            <button
              onClick={() => removeItem(item.product.id)}
              className="absolute top-2 right-2 w-7 h-7 bg-white border border-black/10 flex items-center justify-center text-black/30 hover:text-black hover:border-black transition-colors text-xs"
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
