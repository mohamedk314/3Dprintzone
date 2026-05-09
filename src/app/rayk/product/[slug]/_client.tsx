"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string; name: string; slug: string;
  shortDescription: string | null; description: string | null;
  price: number; compareAtPrice?: number | null;
  stockQty: number; productType: string; sku: string | null;
  category: { name: string; slug: string } | null;
  images: { imageUrl: string; altText?: string | null; isPrimary: boolean }[];
}

function RaykProductSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse">
      <div className="h-3 bg-gray-100 rounded w-32 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <div className="aspect-square bg-gray-100" />
          <div className="flex gap-2 mt-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-16 h-16 bg-gray-100" />
            ))}
          </div>
        </div>
        <div className="space-y-4 pt-4">
          <div className="h-3 bg-gray-100 rounded w-1/4" />
          <div className="h-8 bg-gray-100 rounded w-2/3" />
          <div className="h-6 bg-gray-100 rounded w-1/3" />
          <div className="h-4 bg-gray-100 rounded w-4/5" />
          <div className="h-12 bg-gray-100 rounded mt-6" />
          <div className="h-12 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function RaykProductPageClient() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);

  useEffect(() => {
    fetch(`/api/storefront/products/${slug}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setProduct(d.data); })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <RaykProductSkeleton />;

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/20 mb-3">Product not found</p>
        <p className="text-sm text-black/40 mb-8">This item may have been removed or the URL is incorrect.</p>
        <Link href="/rayk/shop" className="text-xs font-semibold tracking-widest uppercase text-black border border-black px-8 py-3 hover:bg-black hover:text-white transition-colors">
          Back to Shop
        </Link>
      </div>
    );
  }

  const outOfStock = product.productType === "physical" && product.stockQty === 0;
  const hasDiscount = product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);
  const sortedImages = [...product.images].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));

  async function addToCart() {
    setAdding(true);
    await fetch("/api/storefront/cart", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product!.id, qty, brand: "rayk" }),
    });
    window.dispatchEvent(new Event("rayk-cart-updated"));
    setAdded(true);
    setAdding(false);
    setTimeout(() => setAdded(false), 2000);
  }

  async function toggleWishlist() {
    if (wished) {
      await fetch(`/api/storefront/wishlist/${product!.id}?brand=rayk`, { method: "DELETE", credentials: "include" });
    } else {
      await fetch("/api/storefront/wishlist", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product!.id, brand: "rayk" }),
      });
    }
    window.dispatchEvent(new Event("rayk-wishlist-updated"));
    setWished(!wished);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-[10px] font-semibold tracking-[0.3em] uppercase text-black/30">
        <Link href="/rayk/shop" className="hover:text-black transition-colors">Shop</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/rayk/category/${product.category.slug}`} className="hover:text-black transition-colors">
              {product.category.name}
            </Link>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square bg-gray-50 overflow-hidden">
            {sortedImages[activeImage] ? (
              <Image
                src={sortedImages[activeImage].imageUrl}
                alt={sortedImages[activeImage].altText ?? product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-opacity duration-200"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-black/10">
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          {sortedImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {sortedImages.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`shrink-0 relative w-16 h-16 border-2 overflow-hidden transition-all duration-150 hover:scale-105 ${i === activeImage ? "border-black" : "border-transparent hover:border-black/30"}`}
                >
                  <Image src={img.imageUrl} alt={img.altText ?? ""} fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-5">
          {product.category && (
            <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-black/30">{product.category.name}</p>
          )}
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">{product.name}</h1>

          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold">{Number(product.price).toFixed(0)} EGP</span>
            {hasDiscount && (
              <span className="text-sm text-black/30 line-through">{Number(product.compareAtPrice).toFixed(0)} EGP</span>
            )}
          </div>

          {product.shortDescription && (
            <p className="text-sm text-black/60 leading-relaxed tracking-wide">{product.shortDescription}</p>
          )}

          {product.productType === "physical" && (
            <p className={`text-xs font-semibold tracking-widest uppercase ${outOfStock ? "text-red-400" : product.stockQty <= 5 ? "text-amber-500" : "text-black/30"}`}>
              {outOfStock ? "Sold Out" : product.stockQty <= 5 ? `${product.stockQty} left` : "In Stock"}
            </p>
          )}

          {!outOfStock && (
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-black/20">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-lg font-light hover:bg-black hover:text-white transition-colors">−</button>
                <span className="w-10 text-center text-sm font-medium">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product!.stockQty, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-lg font-light hover:bg-black hover:text-white transition-colors">+</button>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {outOfStock ? (
              <div className="flex-1 border border-black/20 py-3 text-center text-xs font-semibold tracking-widest uppercase text-black/30">
                Sold Out
              </div>
            ) : (
              <button
                onClick={addToCart}
                disabled={adding}
                className={`flex-1 py-3.5 text-xs font-semibold tracking-widest uppercase transition-all duration-150 active:scale-[0.98] ${
                  added ? "bg-black/70 text-white" : "bg-black text-white hover:bg-black/80"
                }`}
              >
                {adding ? "Adding..." : added ? "Added!" : "Add to Cart"}
              </button>
            )}
            <button onClick={toggleWishlist}
              className={`w-12 h-12 border flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 ${wished ? "bg-black text-white border-black" : "border-black/20 hover:border-black"}`}
            >
              <svg className="w-4 h-4" fill={wished ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          {!outOfStock && (
            <button
              onClick={async () => { await addToCart(); router.push("/rayk/checkout"); }}
              className="w-full border border-black py-3 text-xs font-semibold tracking-widest uppercase hover:bg-black hover:text-white transition-colors duration-150 active:scale-[0.98]"
            >
              Buy Now
            </button>
          )}

          {product.description && (
            <div className="pt-4 border-t border-black/5">
              <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-black/30 mb-3">Description</p>
              <p className="text-sm text-black/60 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {product.sku && (
            <p className="text-xs text-black/20 tracking-widest font-mono">SKU: {product.sku}</p>
          )}
        </div>
      </div>
    </div>
  );
}
