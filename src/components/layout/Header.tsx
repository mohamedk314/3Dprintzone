"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

interface Counts { cart: number; wishlist: number }

async function fetchCounts(): Promise<Counts> {
  try {
    const [cartRes, wishlistRes] = await Promise.all([
      fetch("/api/storefront/cart", { credentials: "include" }),
      fetch("/api/storefront/wishlist", { credentials: "include" }),
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

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [counts, setCounts] = useState<Counts>({ cart: 0, wishlist: 0 });
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    if (searchOpen) mobileSearchRef.current?.focus();
  }, [searchOpen]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/shop?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setSearchOpen(false);
      setMenuOpen(false);
    }
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="font-extrabold text-lg text-gray-900 tracking-tight hidden sm:block">
              3D<span className="text-indigo-600">printzone</span>
            </span>
          </Link>

          {/* RAYK brand switcher */}
          <div className="hidden sm:flex items-center gap-2 ml-1">
            <div className="w-px h-6 bg-gray-200" />
            <Link href="/rayk" className="relative flex items-center h-8 w-20 opacity-60 hover:opacity-100 transition-opacity">
              <Image src="/brands/rayk-logo.png" alt="RAYK" fill className="object-contain object-left" />
            </Link>
          </div>

          {/* Search bar — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-auto lg:mx-4">
            <div className="relative w-full">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
          </form>

          {/* Right icons */}
          <div className="flex items-center gap-0.5 ml-auto">

            {/* Mobile search toggle */}
            <button
              onClick={() => { setSearchOpen(!searchOpen); setMenuOpen(false); }}
              className="md:hidden p-2.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Account */}
            <Link
              href="/account"
              className="hidden sm:flex p-2.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
              aria-label="My account"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>

            {/* Wishlist */}
            <Link href="/wishlist" className="relative p-2.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors" aria-label="Wishlist">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {counts.wishlist > 0 && (
                <span className="absolute top-1 right-1 bg-indigo-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                  {counts.wishlist > 9 ? "9+" : counts.wishlist}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-2.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors" aria-label="Cart">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {counts.cart > 0 && (
                <span className="absolute top-1 right-1 bg-orange-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                  {counts.cart > 9 ? "9+" : counts.cart}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false); }}
              className="sm:hidden p-2.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors ml-0.5"
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={mobileSearchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="sm:hidden fixed inset-0 top-16 z-50 bg-white border-t border-gray-100 overflow-y-auto">
          <nav className="max-w-7xl mx-auto px-4 py-5 space-y-1">
            {[
              { href: "/", label: "Home" },
              { href: "/shop", label: "All Products" },
              { href: "/custom-request", label: "Custom Request" },
              { href: "/track-order", label: "Track Order" },
              { href: "/account", label: "My Account" },
              { href: "/wishlist", label: "Wishlist" },
              { href: "/cart", label: "Cart" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  pathname === href
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                }`}
              >
                {label}
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}

            <div className="pt-2 pb-1">
              <div className="h-px bg-gray-100" />
            </div>

            {/* RAYK brand switcher in mobile */}
            <Link
              href="/rayk"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-black tracking-widest uppercase transition-colors text-gray-700 hover:bg-gray-50 hover:text-black"
            >
              RAYK
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <div className="pt-2">
              <div className="h-px bg-gray-100" />
            </div>

            <a
              href="https://instagram.com/3dprintzone.eg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              @3dprintzone.eg
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
