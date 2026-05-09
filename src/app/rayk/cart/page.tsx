"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface CartItem {
  id: string; qty: number; unitPrice: number;
  product: { id: string; name: string; slug: string; stockQty: number; productType: string; isActive: boolean; images: { imageUrl: string }[] };
}
interface CartData { items: CartItem[]; subtotal: string; itemCount: number }

function RaykCartSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-7 bg-gray-100 rounded w-20 mb-8" />
      <div className="space-y-px">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-6 border-b border-black/5">
            <div className="w-24 h-32 bg-gray-100 shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-100 rounded w-3/5" />
              <div className="h-3 bg-gray-100 rounded w-1/4" />
              <div className="h-8 bg-gray-100 rounded w-28 mt-4" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 h-12 bg-gray-100 rounded w-48" />
    </div>
  );
}

export default function RaykCartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  async function fetchCart() {
    const res = await fetch("/api/storefront/cart?brand=rayk", { credentials: "include" });
    const data = await res.json();
    setCart(data?.data ?? null);
  }

  useEffect(() => { fetchCart().finally(() => setLoading(false)); }, []);

  async function updateQty(productId: string, qty: number) {
    setUpdating(productId);
    await fetch(`/api/storefront/cart/${productId}?brand=rayk`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qty, brand: "rayk" }),
    });
    await fetchCart();
    window.dispatchEvent(new Event("rayk-cart-updated"));
    setUpdating(null);
  }

  async function removeItem(productId: string) {
    setUpdating(productId);
    await fetch(`/api/storefront/cart/${productId}?brand=rayk`, { method: "DELETE", credentials: "include" });
    await fetchCart();
    window.dispatchEvent(new Event("rayk-cart-updated"));
    setUpdating(null);
  }

  if (loading) return <RaykCartSkeleton />;

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 border border-black/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-7 h-7 text-black/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/20 mb-2">Your cart is empty</p>
        <p className="text-sm text-black/40 mb-8 tracking-wide">Discover something beautiful</p>
        <Link href="/rayk/shop" className="text-xs font-semibold tracking-widest uppercase text-black border border-black px-10 py-3 hover:bg-black hover:text-white transition-colors duration-150">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight mb-8">Cart <span className="text-black/30 font-normal text-lg">({items.length})</span></h1>

      <div className="space-y-px">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 py-6 border-b border-black/5">
            <Link href={`/rayk/product/${item.product.slug}`} className="shrink-0 w-24 h-32 bg-gray-50 overflow-hidden relative">
              {item.product.images[0] ? (
                <Image
                  src={item.product.images[0].imageUrl}
                  alt={item.product.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100" />
              )}
            </Link>
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div className="flex justify-between gap-2">
                <Link href={`/rayk/product/${item.product.slug}`} className="text-sm font-semibold tracking-wide hover:underline underline-offset-2 line-clamp-2 leading-snug">
                  {item.product.name}
                </Link>
                <p className="text-sm font-bold shrink-0">{(Number(item.unitPrice) * item.qty).toFixed(0)} EGP</p>
              </div>
              <p className="text-xs text-black/30 mt-1">{Number(item.unitPrice).toFixed(0)} EGP each</p>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center border border-black/20">
                  <button onClick={() => updateQty(item.product.id, item.qty - 1)}
                    disabled={updating === item.product.id}
                    className="w-8 h-8 flex items-center justify-center text-lg font-light hover:bg-black hover:text-white transition-colors disabled:opacity-30">−</button>
                  <span className="w-8 text-center text-xs font-medium">{updating === item.product.id ? "…" : item.qty}</span>
                  <button onClick={() => updateQty(item.product.id, item.qty + 1)}
                    disabled={updating === item.product.id || (item.product.productType === "physical" && item.qty >= item.product.stockQty)}
                    className="w-8 h-8 flex items-center justify-center text-lg font-light hover:bg-black hover:text-white transition-colors disabled:opacity-30">+</button>
                </div>
                <button onClick={() => removeItem(item.product.id)}
                  disabled={updating === item.product.id}
                  className="text-[10px] font-semibold tracking-[0.25em] uppercase text-black/30 hover:text-black transition-colors disabled:opacity-30"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-black/30 mb-1">Subtotal</p>
          <p className="text-2xl font-bold">{cart?.subtotal} EGP</p>
          <p className="text-xs text-black/30 tracking-wide mt-1">Shipping calculated at checkout</p>
        </div>
        <div className="flex flex-col gap-3 w-full sm:w-auto">
          <button onClick={() => router.push("/rayk/checkout")}
            className="bg-black text-white px-12 py-3.5 text-xs font-semibold tracking-widest uppercase hover:bg-black/80 transition-colors active:scale-[0.97]"
          >
            Checkout
          </button>
          <Link href="/rayk/shop" className="text-center text-[10px] font-semibold tracking-[0.3em] uppercase text-black/30 hover:text-black transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
