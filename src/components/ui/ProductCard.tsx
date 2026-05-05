"use client";

import { useState } from "react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  price: number;
  compareAtPrice?: number | null;
  stockQty: number;
  productType: string;
  isFeatured?: boolean;
  category?: { name: string; slug: string } | null;
  images?: { imageUrl: string; altText?: string | null }[];
}

export default function ProductCard({ product }: { product: Product }) {
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [cartMsg, setCartMsg] = useState<string | null>(null);

  const image = product.images?.[0];
  const isOutOfStock = product.productType === "physical" && product.stockQty === 0;
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  async function addToCart() {
    if (isOutOfStock || addingToCart) return;
    setAddingToCart(true);
    setCartMsg(null);
    try {
      const res = await fetch("/api/storefront/cart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, qty: 1 }),
      });
      const data = await res.json();
      if (data.success) {
        setCartMsg("Added!");
        window.dispatchEvent(new Event("cart-updated"));
        setTimeout(() => setCartMsg(null), 2000);
      } else {
        setCartMsg(data.message || "Error");
        setTimeout(() => setCartMsg(null), 2500);
      }
    } catch {
      setCartMsg("Error");
      setTimeout(() => setCartMsg(null), 2500);
    } finally {
      setAddingToCart(false);
    }
  }

  async function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    if (togglingWishlist) return;
    setTogglingWishlist(true);
    try {
      if (wishlisted) {
        await fetch(`/api/storefront/wishlist/${product.id}`, {
          method: "DELETE",
          credentials: "include",
        });
        setWishlisted(false);
      } else {
        await fetch("/api/storefront/wishlist", {
          method: "POST",
          credentials: "include",
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
      {/* Image */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
        {image?.imageUrl ? (
          <img
            src={image.imageUrl}
            alt={image.altText || product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              Featured
            </span>
          )}
        </div>
        {/* Wishlist button */}
        <button
          onClick={toggleWishlist}
          disabled={togglingWishlist}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all ${
            wishlisted
              ? "bg-red-500 text-white"
              : "bg-white text-gray-400 hover:text-red-500 hover:bg-red-50"
          }`}
        >
          <svg className="w-4 h-4" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </Link>

      {/* Info */}
      <div className="p-3">
        {product.category && (
          <Link href={`/category/${product.category.slug}`} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium mb-1 block">
            {product.category.name}
          </Link>
        )}
        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        {product.shortDescription && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{product.shortDescription}</p>
        )}

        {/* Price + stock */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-900">{Number(product.price).toFixed(0)} EGP</span>
            {product.compareAtPrice && (
              <span className="text-xs text-gray-400 line-through">{Number(product.compareAtPrice).toFixed(0)} EGP</span>
            )}
          </div>
          {product.productType === "physical" && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              isOutOfStock ? "bg-red-50 text-red-500" : product.stockQty <= 5 ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"
            }`}>
              {isOutOfStock ? "Out of stock" : product.stockQty <= 5 ? `${product.stockQty} left` : "In stock"}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={addToCart}
          disabled={isOutOfStock || addingToCart}
          className={`mt-2.5 w-full py-2 rounded-lg text-sm font-semibold transition-all ${
            isOutOfStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : cartMsg === "Added!"
              ? "bg-green-500 text-white"
              : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
          }`}
        >
          {addingToCart ? "Adding..." : cartMsg || (isOutOfStock ? "Out of Stock" : "Add to Cart")}
        </button>
      </div>
    </div>
  );
}
