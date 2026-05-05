"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Product {
  id: string; name: string; slug: string;
  shortDescription?: string | null; description?: string | null;
  price: number; compareAtPrice?: number | null;
  stockQty: number; productType: string; sku?: string | null;
  isFeatured?: boolean; isActive?: boolean;
  category?: { name: string; slug: string } | null;
  images?: { imageUrl: string; altText?: string | null; isPrimary?: boolean }[];
}

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMsg, setCartMsg] = useState<string | null>(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  useEffect(() => {
    fetch(`/api/storefront/products/${params.slug}`, { credentials: "include" })
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        const p = d?.data ?? null;
        setProduct(p);
        // set primary image as active
        if (p?.images?.length) {
          const primaryIdx = p.images.findIndex((img: { isPrimary?: boolean }) => img.isPrimary);
          setActiveImage(primaryIdx >= 0 ? primaryIdx : 0);
        }
      })
      .finally(() => setLoading(false));
  }, [params.slug]);

  async function addToCart() {
    if (!product || addingToCart) return;
    setAddingToCart(true);
    setCartMsg(null);
    try {
      const res = await fetch("/api/storefront/cart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, qty }),
      });
      const data = await res.json();
      if (data.success) {
        setCartMsg("Added to cart!");
        window.dispatchEvent(new Event("cart-updated"));
        setTimeout(() => setCartMsg(null), 3000);
      } else {
        setCartMsg(data.message || "Failed to add");
        setTimeout(() => setCartMsg(null), 3000);
      }
    } catch {
      setCartMsg("Error. Please try again.");
      setTimeout(() => setCartMsg(null), 3000);
    } finally {
      setAddingToCart(false);
    }
  }

  async function toggleWishlist() {
    if (!product || togglingWishlist) return;
    setTogglingWishlist(true);
    try {
      if (wishlisted) {
        await fetch(`/api/storefront/wishlist/${product.id}`, { method: "DELETE", credentials: "include" });
        setWishlisted(false);
      } else {
        await fetch("/api/storefront/wishlist", {
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        });
        setWishlisted(true);
      }
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch {
      // ignore
    } finally {
      setTogglingWishlist(false);
    }
  }

  if (notFound) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
        <Link href="/shop" className="text-indigo-600 hover:underline">Browse all products</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square bg-gray-200 rounded-xl" />
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-10 bg-gray-200 rounded w-1/3 mt-6" />
            <div className="h-12 bg-gray-200 rounded mt-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const isOutOfStock = product.productType === "physical" && product.stockQty === 0;
  const maxQty = product.productType === "physical" ? product.stockQty : 99;
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  const images = product.images ?? [];
  const currentImage = images[activeImage];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-indigo-600">Shop</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/category/${product.category.slug}`} className="hover:text-indigo-600">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900 font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          {/* Main image */}
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-3">
            {currentImage?.imageUrl ? (
              <img
                src={currentImage.imageUrl}
                alt={currentImage.altText || product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === activeImage ? "border-indigo-500" : "border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  {img.imageUrl ? (
                    <img src={img.imageUrl} alt={img.altText || ""} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category && (
            <Link href={`/category/${product.category.slug}`} className="text-sm text-indigo-500 hover:text-indigo-700 font-medium mb-2 block">
              {product.category.name}
            </Link>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

          {/* Price */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-extrabold text-gray-900">{Number(product.price).toFixed(0)} EGP</span>
            {product.compareAtPrice && (
              <>
                <span className="text-xl text-gray-400 line-through">{Number(product.compareAtPrice).toFixed(0)} EGP</span>
                <span className="bg-red-500 text-white text-sm font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
              </>
            )}
          </div>

          {/* Short description */}
          {product.shortDescription && (
            <p className="text-gray-600 mb-4 leading-relaxed">{product.shortDescription}</p>
          )}

          {/* SKU */}
          {product.sku && (
            <p className="text-xs text-gray-400 mb-4">SKU: {product.sku}</p>
          )}

          {/* Stock status */}
          {product.productType === "physical" && (
            <div className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full mb-4 ${
              isOutOfStock ? "bg-red-50 text-red-600" : product.stockQty <= 5 ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOutOfStock ? "bg-red-400" : product.stockQty <= 5 ? "bg-amber-400" : "bg-green-400"}`} />
              {isOutOfStock ? "Out of Stock" : product.stockQty <= 5 ? `Only ${product.stockQty} left` : "In Stock"}
            </div>
          )}

          {/* Qty selector */}
          {!isOutOfStock && (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-gray-600 font-medium">Qty:</span>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-medium">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Cart message */}
          {cartMsg && (
            <div className={`text-sm font-medium mb-3 px-3 py-2 rounded-lg ${
              cartMsg === "Added to cart!" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}>
              {cartMsg}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={addToCart}
              disabled={isOutOfStock || addingToCart}
              className={`flex-1 py-3 rounded-xl font-bold text-base transition-all ${
                isOutOfStock
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
              }`}
            >
              {addingToCart ? "Adding..." : isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
            <button
              onClick={toggleWishlist}
              disabled={togglingWishlist}
              className={`p-3 rounded-xl border-2 transition-all ${
                wishlisted
                  ? "border-red-300 bg-red-50 text-red-500"
                  : "border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500"
              }`}
            >
              <svg className="w-6 h-6" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          {!isOutOfStock && (
            <button
              onClick={async () => { await addToCart(); router.push("/cart"); }}
              className="w-full py-3 rounded-xl font-bold text-base border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              Buy Now
            </button>
          )}

          {/* Delivery info */}
          <div className="mt-6 bg-gray-50 rounded-xl p-4 space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Cash on Delivery available
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              InstaPay accepted
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Delivery across Egypt
            </div>
          </div>
        </div>
      </div>

      {/* Full description */}
      {product.description && (
        <div className="mt-12 border-t border-gray-100 pt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Product Description</h2>
          <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
            {product.description}
          </div>
        </div>
      )}
    </div>
  );
}
