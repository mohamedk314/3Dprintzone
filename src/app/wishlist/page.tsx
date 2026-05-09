"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number | null;
    stockQty: number;
    productType: string;
    images?: { imageUrl: string; altText?: string | null }[];
    category?: { name: string; slug: string } | null;
  };
}

function WishlistSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-7 bg-gray-200 rounded w-32 mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-100">
            <div className="aspect-square bg-gray-200" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-4/5" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-8 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [cartMsg, setCartMsg] = useState<{ id: string; msg: string } | null>(null);

  async function fetchWishlist() {
    const res = await fetch("/api/storefront/wishlist", { credentials: "include" });
    const data = await res.json();
    setItems(data?.data?.items ?? []);
  }

  useEffect(() => {
    fetchWishlist().finally(() => setLoading(false));
  }, []);

  async function removeItem(productId: string) {
    setRemoving(productId);
    await fetch(`/api/storefront/wishlist/${productId}`, { method: "DELETE", credentials: "include" });
    await fetchWishlist();
    window.dispatchEvent(new Event("wishlist-updated"));
    setRemoving(null);
  }

  async function addToCart(productId: string) {
    setAddingToCart(productId);
    try {
      const res = await fetch("/api/storefront/cart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, qty: 1 }),
      });
      const data = await res.json();
      if (data.success) {
        setCartMsg({ id: productId, msg: "Added!" });
        window.dispatchEvent(new Event("cart-updated"));
      } else {
        setCartMsg({ id: productId, msg: data.message || "Error" });
      }
      setTimeout(() => setCartMsg(null), 2500);
    } finally {
      setAddingToCart(null);
    }
  }

  if (loading) return <WishlistSkeleton />;

  if (items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-7">Save items you love by tapping the heart icon</p>
        <Link
          href="/shop"
          className="inline-block bg-indigo-600 text-white font-bold px-8 py-3.5 rounded-full hover:bg-indigo-700 transition-colors active:scale-[0.97]"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Wishlist</h1>
        <span className="text-sm text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">{items.length} item{items.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {items.map((item) => {
          const p = item.product;
          const img = p.images?.[0];
          const isOutOfStock = p.productType === "physical" && p.stockQty === 0;
          const discount = p.compareAtPrice
            ? Math.round((1 - p.price / p.compareAtPrice) * 100)
            : 0;
          const thisMsg = cartMsg?.id === p.id ? cartMsg.msg : null;

          return (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
              {/* Image */}
              <div className="relative aspect-square bg-gray-50 overflow-hidden">
                <Link href={`/product/${p.slug}`} className="block w-full h-full">
                  {img?.imageUrl ? (
                    <Image
                      src={img.imageUrl}
                      alt={img.altText || p.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </Link>
                {discount > 0 && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                    -{discount}%
                  </span>
                )}
                <button
                  onClick={() => removeItem(p.id)}
                  disabled={removing === p.id}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-red-400 hover:bg-red-50 hover:scale-110 transition-all duration-150 active:scale-95 disabled:opacity-50"
                  title="Remove from wishlist"
                >
                  <svg className="w-4 h-4" fill="currentColor" stroke="none" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* Info */}
              <div className="p-3">
                {p.category && (
                  <p className="text-xs text-indigo-500 font-medium mb-0.5">{p.category.name}</p>
                )}
                <Link href={`/product/${p.slug}`} className="block text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2 leading-tight mb-2">
                  {p.name}
                </Link>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="font-bold text-gray-900 text-sm">{Number(p.price).toFixed(0)} EGP</span>
                  {p.compareAtPrice && (
                    <span className="text-xs text-gray-400 line-through">{Number(p.compareAtPrice).toFixed(0)} EGP</span>
                  )}
                </div>
                <button
                  onClick={() => addToCart(p.id)}
                  disabled={isOutOfStock || addingToCart === p.id}
                  className={`w-full py-2 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-[0.97] ${
                    isOutOfStock
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : thisMsg === "Added!"
                      ? "bg-green-500 text-white"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  {addingToCart === p.id ? "Adding..." : thisMsg || (isOutOfStock ? "Out of Stock" : "Add to Cart")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
