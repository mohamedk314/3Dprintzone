"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface Counts { cart: number; wishlist: number }

async function fetchCounts(): Promise<Counts> {
  try {
    const [cartRes, wishlistRes] = await Promise.all([
      fetch("/api/storefront/cart", { credentials: "include" }),
      fetch("/api/storefront/wishlist", { credentials: "include" }),
    ]);
    const [cartData, wishlistData] = await Promise.all([cartRes.json(), wishlistRes.json()]);
    const cartCount = cartData?.data?.items?.length ?? 0;
    const wishlistCount = wishlistData?.data?.items?.length ?? 0;
    return { cart: cartCount, wishlist: wishlistCount };
  } catch {
    return { cart: 0, wishlist: 0 };
  }
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [counts, setCounts] = useState<Counts>({ cart: 0, wishlist: 0 });
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCounts().then(setCounts);
    const handler = () => fetchCounts().then(setCounts);
    window.addEventListener("cart-updated", handler);
    window.addEventListener("wishlist-updated", handler);
    return () => {
      window.removeEventListener("cart-updated", handler);
      window.removeEventListener("wishlist-updated", handler);
    };
  }, [pathname]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/shop?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo + brand switcher */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
              </div>
              <span className="font-bold text-xl text-indigo-600 hidden sm:block">3Dprintzone</span>
            </Link>
            <span className="text-gray-200 hidden sm:block">|</span>
            <Link href="/rayk" className="hidden sm:block text-xs font-bold tracking-[0.25em] uppercase text-gray-400 hover:text-black transition-colors">
              RAYK
            </Link>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto">
            <div className="relative">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-gray-50"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Icons */}
          <div className="flex items-center gap-1">
            <Link href="/wishlist" className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {counts.wishlist > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-indigo-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {counts.wishlist > 9 ? "9+" : counts.wishlist}
                </span>
              )}
            </Link>
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {counts.cart > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {counts.cart > 9 ? "9+" : counts.cart}
                </span>
              )}
            </Link>
            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-gray-600 hover:text-indigo-600 transition-colors sm:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="mt-3 pt-3 border-t border-gray-100 sm:hidden flex flex-col gap-2 text-sm">
            <Link href="/" onClick={() => setMenuOpen(false)} className="py-1 text-gray-700 hover:text-indigo-600">Home</Link>
            <Link href="/shop" onClick={() => setMenuOpen(false)} className="py-1 text-gray-700 hover:text-indigo-600">Shop</Link>
            <Link href="/custom-request" onClick={() => setMenuOpen(false)} className="py-1 text-gray-700 hover:text-indigo-600">Custom Request</Link>
            <Link href="/track-order" onClick={() => setMenuOpen(false)} className="py-1 text-gray-700 hover:text-indigo-600">Track Order</Link>
          </div>
        )}
      </div>
    </header>
  );
}
