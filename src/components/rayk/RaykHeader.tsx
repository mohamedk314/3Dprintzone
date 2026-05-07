"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

interface Counts { cart: number; wishlist: number }

async function fetchRaykCounts(): Promise<Counts> {
  try {
    const [cartRes, wishlistRes] = await Promise.all([
      fetch("/api/storefront/cart?brand=rayk", { credentials: "include" }),
      fetch("/api/storefront/wishlist?brand=rayk", { credentials: "include" }),
    ]);
    const [cartData, wishlistData] = await Promise.all([cartRes.json(), wishlistRes.json()]);
    return {
      cart: cartData?.data?.items?.length ?? 0,
      wishlist: wishlistData?.data?.items?.length ?? 0,
    };
  } catch {
    return { cart: 0, wishlist: 0 };
  }
}

export default function RaykHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [counts, setCounts] = useState<Counts>({ cart: 0, wishlist: 0 });
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchRaykCounts().then(setCounts);
    const handler = () => fetchRaykCounts().then(setCounts);
    window.addEventListener("rayk-cart-updated", handler);
    window.addEventListener("rayk-wishlist-updated", handler);
    return () => {
      window.removeEventListener("rayk-cart-updated", handler);
      window.removeEventListener("rayk-wishlist-updated", handler);
    };
  }, [pathname]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/rayk/shop?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  }

  return (
    <header className="bg-white border-b border-black/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-6">
          {/* Brand switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/" className="text-xs font-medium text-gray-400 hover:text-gray-600 tracking-widest uppercase transition-colors">
              3Dprintzone
            </Link>
            <span className="text-gray-200">|</span>
            <Link href="/rayk" className="text-xs font-bold text-black tracking-widest uppercase border-b border-black pb-0.5">
              RAYK
            </Link>
          </div>

          {/* Logo */}
          <Link href="/rayk" className="flex-1 flex justify-center md:justify-start items-center">
            <div className="relative h-8 w-24">
              <Image
                src="/brands/rayk-logo.png"
                alt="RAYK"
                fill
                className="object-contain object-left"
                priority
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  (e.currentTarget.nextSibling as HTMLElement | null)?.removeAttribute("hidden");
                }}
              />
              <span hidden className="text-xl font-bold tracking-[0.3em] uppercase text-black">RAYK</span>
            </div>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-4 pr-10 py-2 border border-black/20 text-sm focus:outline-none focus:border-black bg-white tracking-wide"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Nav + Icons */}
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6 text-xs tracking-widest uppercase font-medium">
              <Link href="/rayk/shop" className="text-black/70 hover:text-black transition-colors">Shop</Link>
              <Link href="/rayk/track-order" className="text-black/70 hover:text-black transition-colors">Orders</Link>
            </nav>
            <Link href="/rayk/wishlist" className="relative p-1.5 text-black/60 hover:text-black transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {counts.wishlist > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                  {counts.wishlist > 9 ? "9+" : counts.wishlist}
                </span>
              )}
            </Link>
            <Link href="/rayk/cart" className="relative p-1.5 text-black/60 hover:text-black transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {counts.cart > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                  {counts.cart > 9 ? "9+" : counts.cart}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 text-black/60 hover:text-black transition-colors md:hidden"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="mt-4 pt-4 border-t border-black/10 md:hidden space-y-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="flex-1 border border-black/20 px-3 py-2 text-sm focus:outline-none focus:border-black"
              />
              <button type="submit" className="border border-black px-3 py-2 text-xs tracking-widest uppercase font-medium">
                Go
              </button>
            </form>
            <nav className="flex flex-col gap-2 text-xs tracking-widest uppercase font-medium">
              <Link href="/rayk" onClick={() => setMenuOpen(false)} className="py-1 text-black/70 hover:text-black">Home</Link>
              <Link href="/rayk/shop" onClick={() => setMenuOpen(false)} className="py-1 text-black/70 hover:text-black">Shop</Link>
              <Link href="/rayk/track-order" onClick={() => setMenuOpen(false)} className="py-1 text-black/70 hover:text-black">Track Order</Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
