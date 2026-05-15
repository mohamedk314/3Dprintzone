"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

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
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const image = product.images?.[0];
  const outOfStock = product.productType === "physical" && product.stockQty === 0;
  const hasDiscount = product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);
  const discountPct = hasDiscount
    ? Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100)
    : null;

  async function addToCart() {
    if (adding || added) return;
    setAdding(true);
    try {
      await fetch("/api/storefront/cart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, qty: 1, brand: "rayk" }),
      });
      window.dispatchEvent(new Event("rayk-cart-updated"));
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="group bg-white border border-black/5 transition-[transform,box-shadow,border-color] duration-200 will-change-transform hover:border-black/25 hover:-translate-y-[2px] hover:shadow-[0_18px_36px_-22px_rgba(0,0,0,0.35)]">
      <Link href={`/rayk/product/${product.slug}`} className="block" aria-label={product.name}>
        <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
          {image ? (
            <Image
              src={image.imageUrl}
              alt={image.altText ?? product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-[700ms] will-change-transform group-hover:scale-[1.05]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-black/10">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {discountPct && (
            <span className="absolute top-2.5 left-2.5 bg-black text-white text-[10px] font-bold px-2 py-0.5 tracking-[0.18em] uppercase">
              -{discountPct}%
            </span>
          )}
          {outOfStock && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-black/50">Sold Out</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-3 sm:p-3.5 space-y-2.5">
        <Link href={`/rayk/product/${product.slug}`}>
          <p className="text-sm font-medium text-black tracking-wide leading-snug line-clamp-2 hover:underline underline-offset-[3px] decoration-1">
            {product.name}
          </p>
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-black tabular-nums">{Number(product.price).toFixed(0)} EGP</span>
          {hasDiscount && (
            <span className="text-xs text-black/30 line-through tabular-nums">{Number(product.compareAtPrice).toFixed(0)}</span>
          )}
        </div>
        {!outOfStock && (
          <button
            onClick={addToCart}
            disabled={adding}
            className={`press w-full border text-[11px] font-semibold tracking-[0.18em] uppercase py-2.5 transition-[background-color,color,border-color] duration-200 ${
              added
                ? "bg-black text-white border-black"
                : "border-black text-black hover:bg-black hover:text-white"
            }`}
          >
            {adding ? "Adding…" : added ? "Added" : "Add to Cart"}
          </button>
        )}
      </div>
    </div>
  );
}
