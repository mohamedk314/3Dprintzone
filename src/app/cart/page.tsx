"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CartItem {
  id: string;
  qty: number;
  unitPrice: number;
  product: {
    id: string;
    name: string;
    slug: string;
    stockQty: number;
    productType: string;
    images?: { imageUrl: string; altText?: string | null }[];
  };
}

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  async function fetchCart() {
    try {
      const res = await fetch("/api/storefront/cart", { credentials: "include" });
      const data = await res.json();
      setItems(data?.data?.items ?? []);
    } catch {
      setItems([]);
    }
  }

  useEffect(() => {
    fetchCart().finally(() => setLoading(false));
  }, []);

  async function updateQty(productId: string, newQty: number) {
    setUpdating(productId);
    try {
      if (newQty === 0) {
        await fetch(`/api/storefront/cart/${productId}`, { method: "DELETE", credentials: "include" });
      } else {
        await fetch(`/api/storefront/cart/${productId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qty: newQty }),
        });
      }
      await fetchCart();
      window.dispatchEvent(new Event("cart-updated"));
    } finally {
      setUpdating(null);
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const shippingFee = 0;
  const total = subtotal + shippingFee;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-7 bg-gray-200 rounded w-32 mb-6" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 flex gap-4">
            <div className="w-20 h-20 bg-gray-200 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <svg className="w-20 h-20 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Browse our products and add some to your cart</p>
        <Link href="/shop" className="inline-block bg-indigo-600 text-white font-bold px-8 py-3 rounded-full hover:bg-indigo-700 transition-colors">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items */}
        <div className="flex-1 space-y-3">
          {items.map((item) => {
            const img = item.product.images?.[0];
            const maxQty = item.product.productType === "physical" ? item.product.stockQty : 99;
            return (
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4">
                <Link href={`/product/${item.product.slug}`} className="shrink-0">
                  {img?.imageUrl ? (
                    <img
                      src={img.imageUrl}
                      alt={img.altText || item.product.name}
                      className="w-20 h-20 rounded-lg object-cover border border-gray-100"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.product.slug}`} className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2 text-sm">
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-gray-500 mt-0.5">{Number(item.unitPrice).toFixed(0)} EGP each</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQty(item.product.id, item.qty - 1)}
                        disabled={!!updating}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                      >
                        {item.qty === 1 ? (
                          <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        ) : "−"}
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {updating === item.product.id ? "..." : item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.product.id, item.qty + 1)}
                        disabled={!!updating || item.qty >= maxQty}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{(Number(item.unitPrice) * item.qty).toFixed(0)} EGP</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:w-72 shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-28">
            <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.length} items)</span>
                <span>{subtotal.toFixed(0)} EGP</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shippingFee === 0 ? "text-green-600 font-medium" : ""}>
                  {shippingFee === 0 ? "Free" : `${shippingFee} EGP`}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-bold text-base text-gray-900">
                <span>Total</span>
                <span>{total.toFixed(0)} EGP</span>
              </div>
            </div>
            <button
              onClick={() => router.push("/checkout")}
              className="w-full mt-5 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Proceed to Checkout
            </button>
            <Link href="/shop" className="block text-center text-sm text-indigo-600 hover:underline mt-3">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
