"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string; name: string; slug: string;
  shortDescription?: string | null; description?: string | null;
  price: number; compareAtPrice?: number | null;
  stockQty: number; productType: string; sku?: string | null;
  isFeatured?: boolean; isActive?: boolean;
  category?: { name: string; slug: string } | null;
  images?: { imageUrl: string; altText?: string | null; isPrimary?: boolean }[];
}

interface Review { id: string; name: string; rating: number; body: string | null; createdAt: string }

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`${cls} ${i <= rating ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function ClickableStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <span className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
          className="focus:outline-none transition-transform hover:scale-110 active:scale-95">
          <svg className={`w-6 h-6 transition-colors ${i <= (hover || value) ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </span>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-64 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <div className="aspect-square bg-gray-200 rounded-xl mb-3" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-16 h-16 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-4 pt-2">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-7 bg-gray-200 rounded w-3/4" />
          <div className="h-5 bg-gray-200 rounded w-2/3" />
          <div className="h-10 bg-gray-200 rounded w-1/3 mt-4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-12 bg-gray-200 rounded mt-2" />
          <div className="h-12 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPageClient() {
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

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewMeta, setReviewMeta] = useState<{ total: number; avg: number } | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, body: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);

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
        if (p?.images?.length) {
          const primaryIdx = p.images.findIndex((img: { isPrimary?: boolean }) => img.isPrimary);
          setActiveImage(primaryIdx >= 0 ? primaryIdx : 0);
        }
        if (p?.id) {
          fetch(`/api/storefront/reviews?productId=${p.id}`)
            .then((r) => r.json())
            .then((rd) => { setReviews(rd.data ?? []); setReviewMeta(rd.meta ?? null); });
        }
      })
      .finally(() => setLoading(false));
  }, [params.slug]);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!product || submittingReview) return;
    setSubmittingReview(true);
    setReviewMsg(null);
    try {
      const res = await fetch("/api/storefront/reviews", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, ...reviewForm }),
      });
      const data = await res.json();
      if (data.success) {
        setReviewMsg("Review submitted! It will appear after approval.");
        setReviewForm({ name: "", rating: 5, body: "" });
        setShowReviewForm(false);
      } else {
        setReviewMsg(data.message ?? "Failed to submit review.");
      }
    } catch {
      setReviewMsg("Network error. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  }

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
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
        <p className="text-gray-500 mb-6">This product may have been removed or the URL is incorrect.</p>
        <Link href="/shop" className="inline-block bg-indigo-600 text-white font-bold px-8 py-3 rounded-full hover:bg-indigo-700 transition-colors">
          Browse all products
        </Link>
      </div>
    );
  }

  if (loading) return <ProductDetailSkeleton />;
  if (!product) return null;

  const isOutOfStock = product.productType === "physical" && product.stockQty === 0;
  const maxQty = product.productType === "physical" ? product.stockQty : 99;
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  const images = product.images ?? [];
  const currentImage = images[activeImage];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-indigo-600 transition-colors">Shop</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/category/${product.category.slug}`} className="hover:text-indigo-600 transition-colors">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900 font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Images */}
        <div>
          <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-3">
            {currentImage?.imageUrl ? (
              <Image
                src={currentImage.imageUrl}
                alt={currentImage.altText || product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-opacity duration-200"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`shrink-0 relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-150 hover:scale-105 ${
                    i === activeImage ? "border-indigo-500 shadow-sm" : "border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  {img.imageUrl ? (
                    <Image
                      src={img.imageUrl}
                      alt={img.altText || ""}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
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
            <Link href={`/category/${product.category.slug}`} className="text-sm text-indigo-500 hover:text-indigo-700 font-medium mb-2 block transition-colors">
              {product.category.name}
            </Link>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">{product.name}</h1>

          {/* Rating summary */}
          {reviewMeta && reviewMeta.total > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <Stars rating={Math.round(reviewMeta.avg)} size="sm" />
              <span className="text-sm text-gray-500">{reviewMeta.avg.toFixed(1)} ({reviewMeta.total})</span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-extrabold text-gray-900">{Number(product.price).toFixed(0)} EGP</span>
            {product.compareAtPrice && (
              <>
                <span className="text-xl text-gray-400 line-through">{Number(product.compareAtPrice).toFixed(0)} EGP</span>
                <span className="bg-red-500 text-white text-sm font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
              </>
            )}
          </div>

          {product.shortDescription && (
            <p className="text-gray-600 mb-4 leading-relaxed">{product.shortDescription}</p>
          )}

          {product.sku && (
            <p className="text-xs text-gray-400 mb-4 font-mono">SKU: {product.sku}</p>
          )}

          {product.productType === "physical" && (
            <div className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full mb-4 ${
              isOutOfStock ? "bg-red-50 text-red-600" : product.stockQty <= 5 ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOutOfStock ? "bg-red-400" : product.stockQty <= 5 ? "bg-amber-400" : "bg-green-400"}`} />
              {isOutOfStock ? "Out of Stock" : product.stockQty <= 5 ? `Only ${product.stockQty} left` : "In Stock"}
            </div>
          )}

          {!isOutOfStock && (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-gray-600 font-medium">Qty:</span>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors active:bg-gray-100"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-medium">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors active:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {cartMsg && (
            <div className={`text-sm font-medium mb-3 px-3 py-2 rounded-lg ${
              cartMsg === "Added to cart!" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}>
              {cartMsg}
            </div>
          )}

          <div className="flex gap-3 mb-4">
            <button
              onClick={addToCart}
              disabled={isOutOfStock || addingToCart}
              className={`flex-1 py-3.5 rounded-xl font-bold text-base transition-all duration-150 active:scale-[0.98] ${
                isOutOfStock
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : cartMsg === "Added to cart!"
                  ? "bg-green-500 text-white"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {addingToCart ? "Adding..." : isOutOfStock ? "Out of Stock" : cartMsg || "Add to Cart"}
            </button>
            <button
              onClick={toggleWishlist}
              disabled={togglingWishlist}
              className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 ${
                wishlisted
                  ? "border-red-300 bg-red-50 text-red-500"
                  : "border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500"
              }`}
            >
              <svg className="w-5 h-5" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          {!isOutOfStock && (
            <button
              onClick={async () => { await addToCart(); router.push("/cart"); }}
              className="w-full py-3 rounded-xl font-bold text-base border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-colors active:scale-[0.98] mb-5"
            >
              Buy Now
            </button>
          )}

          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm text-gray-600">
            {[
              "Cash on Delivery available",
              "InstaPay accepted",
              "Delivery across Egypt",
            ].map((text) => (
              <div key={text} className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mt-12 border-t border-gray-100 pt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Product Description</h2>
          <div className="bg-gray-50 rounded-xl p-5 text-gray-600 leading-relaxed whitespace-pre-wrap text-sm">
            {product.description}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="mt-12 border-t border-gray-100 pt-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
            {reviewMeta && reviewMeta.total > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <Stars rating={Math.round(reviewMeta.avg)} />
                <span className="text-sm text-gray-600">{reviewMeta.avg.toFixed(1)} / 5 · {reviewMeta.total} review{reviewMeta.total !== 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowReviewForm((v) => !v)}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-400 px-4 py-2 rounded-lg transition-colors active:scale-[0.97]"
          >
            {showReviewForm ? "Cancel" : "Write a Review"}
          </button>
        </div>

        {reviewMsg && (
          <div className="mb-4 text-sm px-4 py-3 rounded-lg bg-green-50 text-green-700 border border-green-100">{reviewMsg}</div>
        )}

        {showReviewForm && (
          <form onSubmit={submitReview} className="bg-gray-50 rounded-xl p-5 mb-6 space-y-4 border border-gray-100">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Your Rating *</label>
              <ClickableStars value={reviewForm.rating} onChange={(v) => setReviewForm((f) => ({ ...f, rating: v }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Your Name *</label>
              <input required type="text" value={reviewForm.name}
                onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 transition-colors"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Review (optional)</label>
              <textarea value={reviewForm.body}
                onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))}
                rows={3} placeholder="Share your experience with this product..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 resize-none transition-colors"
              />
            </div>
            <button type="submit" disabled={submittingReview}
              className="bg-indigo-600 text-white font-semibold text-sm px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors active:scale-[0.97]">
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
            <svg className="w-10 h-10 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-500 font-medium text-sm mb-1">No reviews yet</p>
            <p className="text-gray-400 text-xs mb-4">Be the first to share your experience</p>
            {!showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Write a Review →
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <Stars rating={r.rating} />
                  <span className="font-semibold text-sm text-gray-900">{r.name}</span>
                  <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                </div>
                {r.body && <p className="text-sm text-gray-700 leading-relaxed">{r.body}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
