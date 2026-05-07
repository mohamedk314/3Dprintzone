"use client";

import Link from "next/link";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  stockQty: number;
  productType: string;
  images?: { imageUrl: string; altText?: string | null }[];
}

export default function RaykProductCard({ product }: { product: Product }) {
  const image = product.images?.[0];
  const outOfStock = product.productType === "physical" && product.stockQty === 0;
  const hasDiscount = product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);
  const discountPct = hasDiscount
    ? Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100)
    : null;

  async function addToCart() {
    await fetch("/api/storefront/cart", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, qty: 1, brand: "rayk" }),
    });
    window.dispatchEvent(new Event("rayk-cart-updated"));
  }

  return (
    <div className="group bg-white border border-black/5 hover:border-black/20 transition-all">
      <Link href={`/rayk/product/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
          {image ? (
            <img
              src={image.imageUrl}
              alt={image.altText ?? product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-black/10">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {discountPct && (
            <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-0.5 tracking-widest uppercase">
              -{discountPct}%
            </span>
          )}
          {outOfStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="text-xs font-semibold tracking-widest uppercase text-black/40">Sold Out</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-3 space-y-2">
        <Link href={`/rayk/product/${product.slug}`}>
          <p className="text-sm font-medium text-black tracking-wide leading-tight hover:underline underline-offset-2">{product.name}</p>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-black">{Number(product.price).toFixed(0)} EGP</span>
          {hasDiscount && (
            <span className="text-xs text-black/30 line-through">{Number(product.compareAtPrice).toFixed(0)}</span>
          )}
        </div>
        {!outOfStock && (
          <button
            onClick={addToCart}
            className="w-full border border-black text-black text-xs font-semibold tracking-widest uppercase py-2 hover:bg-black hover:text-white transition-colors"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
