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

interface Review {
  id: string;
  name: string;
  rating: number;
  body: string | null;
  createdAt: string;
}

function RaykStars({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "w-4 h-4" : "w-3 h-3";
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`${cls} ${i <= rating ? "text-black" : "text-black/15"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function RaykClickableStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <span className="inline-flex gap-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none transition-transform duration-150 hover:scale-110 active:scale-95"
          aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
        >
          <svg
            className={`w-6 h-6 transition-colors duration-150 ${
              i <= (hover || value) ? "text-black" : "text-black/15"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </span>
  );
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

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewMeta, setReviewMeta] = useState<{ total: number; avg: number } | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, body: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/storefront/products/${slug}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setProduct(d.data);
          setReviewsLoading(true);
          fetch(`/api/storefront/reviews?productId=${d.data.id}`)
            .then((rr) => rr.json())
            .then((rd) => {
              setReviews(rd.data ?? []);
              setReviewMeta(rd.meta ?? null);
            })
            .finally(() => setReviewsLoading(false));
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!product || submittingReview) return;
    setSubmittingReview(true);
    setReviewMsg(null);
    try {
      const res = await fetch("/api/storefront/reviews", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, ...reviewForm }),
      });
      const data = await res.json();
      if (data.success) {
        setReviewMsg("Thank you. Your review will appear after approval.");
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

          {/* Aggregate rating */}
          {reviewMeta && reviewMeta.total > 0 && (
            <div className="flex items-center gap-2.5">
              <RaykStars rating={Math.round(reviewMeta.avg)} />
              <span className="text-xs text-black/50 tracking-wide">
                {reviewMeta.avg.toFixed(1)} · {reviewMeta.total} review{reviewMeta.total !== 1 ? "s" : ""}
              </span>
            </div>
          )}

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

      {/* ============================ REVIEWS ============================ */}
      <section className="mt-16 md:mt-20 border-t border-black/10 pt-10 md:pt-12">
        <div className="flex items-end justify-between gap-4 mb-7 flex-wrap">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-black/30 mb-2">
              Customer Reviews
            </p>
            {reviewMeta && reviewMeta.total > 0 ? (
              <div className="flex items-center gap-3">
                <RaykStars rating={Math.round(reviewMeta.avg)} size="lg" />
                <span className="text-sm font-medium text-black tracking-wide">
                  {reviewMeta.avg.toFixed(1)} / 5
                </span>
                <span className="text-xs text-black/40 tracking-wide">
                  · {reviewMeta.total} review{reviewMeta.total !== 1 ? "s" : ""}
                </span>
              </div>
            ) : (
              <p className="text-sm text-black/50">No reviews yet. Be the first.</p>
            )}
          </div>
          <button
            onClick={() => {
              setShowReviewForm((v) => !v);
              setReviewMsg(null);
            }}
            className="text-[11px] font-semibold tracking-widest uppercase border border-black px-6 py-3 hover:bg-black hover:text-white transition-colors duration-150 active:scale-[0.98]"
          >
            {showReviewForm ? "Cancel" : "Write a Review"}
          </button>
        </div>

        {reviewMsg && (
          <div className="mb-6 text-xs tracking-wide text-black/70 bg-black/[0.03] border border-black/10 px-4 py-3">
            {reviewMsg}
          </div>
        )}

        {showReviewForm && (
          <form
            onSubmit={submitReview}
            className="border border-black/10 p-5 sm:p-6 mb-8 space-y-5 bg-white"
          >
            <div>
              <label className="block text-[10px] font-semibold tracking-[0.3em] uppercase text-black/40 mb-2">
                Your Rating
              </label>
              <RaykClickableStars
                value={reviewForm.rating}
                onChange={(v) => setReviewForm((f) => ({ ...f, rating: v }))}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold tracking-[0.3em] uppercase text-black/40 mb-2">
                Your Name
              </label>
              <input
                required
                type="text"
                value={reviewForm.name}
                onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border border-black/15 px-3.5 py-2.5 text-sm focus:outline-none focus:border-black transition-colors duration-150"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold tracking-[0.3em] uppercase text-black/40 mb-2">
                Review <span className="text-black/30 normal-case tracking-normal">(optional)</span>
              </label>
              <textarea
                value={reviewForm.body}
                onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))}
                rows={4}
                placeholder="Share your experience with this product..."
                className="w-full border border-black/15 px-3.5 py-2.5 text-sm focus:outline-none focus:border-black resize-none transition-colors duration-150"
              />
            </div>
            <button
              type="submit"
              disabled={submittingReview}
              className="bg-black text-white text-[11px] font-semibold tracking-widest uppercase px-7 py-3 hover:bg-black/80 disabled:opacity-50 transition-colors duration-150 active:scale-[0.98]"
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}

        {/* Reviews list */}
        {reviewsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="border-b border-black/5 pb-5 animate-pulse">
                <div className="h-3 w-24 bg-black/[0.06] mb-2" />
                <div className="h-3 w-32 bg-black/[0.06] mb-2" />
                <div className="h-3 w-3/4 bg-black/[0.06]" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="border border-black/10 py-12 px-6 text-center">
            <svg className="w-9 h-9 mx-auto mb-3 text-black/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black mb-1.5">
              No reviews yet
            </p>
            <p className="text-xs text-black/40 mb-5 tracking-wide">
              Be the first to share your experience.
            </p>
            {!showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="text-[11px] font-semibold tracking-widest uppercase border border-black px-6 py-2.5 hover:bg-black hover:text-white transition-colors duration-150 active:scale-[0.98]"
              >
                Write a Review
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-black/10">
            {reviews.map((r) => (
              <li key={r.id} className="py-5">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <RaykStars rating={r.rating} />
                  <span className="text-sm font-semibold tracking-wide">{r.name}</span>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-black/30">
                    {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                </div>
                {r.body && (
                  <p className="text-sm text-black/65 leading-relaxed tracking-wide whitespace-pre-line">
                    {r.body}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
