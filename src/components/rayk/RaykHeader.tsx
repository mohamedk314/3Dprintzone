"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

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
      setMobileSearchOpen(false);
    }
  }

  return (
    <header
      className="sticky top-0 z-50"
      style={{ background: "#FBFAF6", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
    >
      <div className="mx-auto flex items-center gap-4 sm:gap-6 px-4 sm:px-6 lg:px-12 h-[64px] sm:h-[72px] lg:h-[78px]"
           style={{ maxWidth: "1440px" }}>
        {/* Brand switcher */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/"
            className="text-[10px] sm:text-[11px] font-medium text-black/40 hover:text-black/70 transition-colors uppercase"
            style={{ letterSpacing: "0.28em" }}
          >
            3DPRINTZONE
          </Link>
          <span className="hidden sm:inline text-black/15">|</span>
          <Link
            href="/rayk"
            className="relative text-[12px] sm:text-[13px] font-semibold text-black uppercase pb-[3px]"
            style={{ letterSpacing: "0.32em" }}
          >
            RAYK
            <span className="absolute left-0 right-0 -bottom-[1px] h-px bg-black/80" />
          </Link>
        </div>

        {/* Centered search (desktop) */}
        <form
          onSubmit={handleSearch}
          className="hidden lg:block mx-auto"
          style={{ width: "300px" }}
        >
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search fixtures..."
              className="w-full bg-white text-[13px] tracking-wide pl-4 pr-10 focus:outline-none"
              style={{
                height: "42px",
                border: "1px solid #E5E1D8",
                borderRadius: "6px",
                color: "#151515",
              }}
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black/45 hover:text-black transition-colors"
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.2-5.2M10.5 17a6.5 6.5 0 110-13 6.5 6.5 0 010 13z" />
              </svg>
            </button>
          </div>
        </form>

        {/* Right nav */}
        <div className="flex items-center gap-3 sm:gap-5 ml-auto">
          <nav className="hidden md:flex items-center gap-5 lg:gap-7">
            <Link
              href="/rayk/shop"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#151515] hover:text-black uppercase transition-colors"
              style={{ letterSpacing: "0.28em" }}
            >
              SHOP
              <svg className="w-3 h-3 mt-px" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 9l6 6 6-6" />
              </svg>
            </Link>
            <Link
              href="/rayk/track-order"
              className="text-[11px] font-semibold text-[#151515] hover:text-black uppercase transition-colors"
              style={{ letterSpacing: "0.28em" }}
            >
              ORDERS
            </Link>
          </nav>

          {/* Mobile search trigger */}
          <button
            type="button"
            aria-label="Open search"
            onClick={() => setMobileSearchOpen((v) => !v)}
            className="lg:hidden p-1.5 text-[#151515] hover:text-black transition-colors"
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.2-5.2M10.5 17a6.5 6.5 0 110-13 6.5 6.5 0 010 13z" />
            </svg>
          </button>

          <Link
            href="/rayk/wishlist"
            aria-label="Wishlist"
            className="relative p-1.5 text-[#151515] hover:text-black transition-colors"
          >
            <svg className="w-[19px] h-[19px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            {counts.wishlist > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {counts.wishlist > 9 ? "9+" : counts.wishlist}
              </span>
            )}
          </Link>

          <Link
            href="/rayk/cart"
            aria-label="Cart"
            className="relative p-1.5 text-[#151515] hover:text-black transition-colors"
          >
            <svg className="w-[19px] h-[19px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 7h12l-1.2 9.6a2 2 0 01-2 1.7H9.2a2 2 0 01-2-1.7L6 7zM9 7V5a3 3 0 116 0v2" />
            </svg>
            {counts.cart > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[9px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-bold leading-none">
                {counts.cart > 99 ? "99+" : counts.cart}
              </span>
            )}
          </Link>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden p-1.5 text-[#151515] hover:text-black transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7h16M4 12h16M4 17h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile inline search */}
      {mobileSearchOpen && (
        <div className="lg:hidden border-t" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
          <form onSubmit={handleSearch} className="px-4 sm:px-6 py-3 max-w-[1440px] mx-auto">
            <div className="relative">
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search fixtures..."
                className="w-full bg-white text-sm tracking-wide pl-4 pr-10 focus:outline-none"
                style={{
                  height: "42px",
                  border: "1px solid #E5E1D8",
                  borderRadius: "6px",
                  color: "#151515",
                }}
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/45 hover:text-black transition-colors"
              >
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.2-5.2M10.5 17a6.5 6.5 0 110-13 6.5 6.5 0 010 13z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
          <nav className="px-4 sm:px-6 py-3 max-w-[1440px] mx-auto flex flex-col gap-1">
            <Link
              href="/rayk"
              onClick={() => setMenuOpen(false)}
              className="py-2 text-[12px] font-semibold text-[#151515] uppercase"
              style={{ letterSpacing: "0.28em" }}
            >
              Home
            </Link>
            <Link
              href="/rayk/shop"
              onClick={() => setMenuOpen(false)}
              className="py-2 text-[12px] font-semibold text-[#151515] uppercase"
              style={{ letterSpacing: "0.28em" }}
            >
              Shop
            </Link>
            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="py-2 text-[12px] font-semibold text-[#151515] uppercase"
              style={{ letterSpacing: "0.28em" }}
            >
              My Account
            </Link>
            <Link
              href="/rayk/track-order"
              onClick={() => setMenuOpen(false)}
              className="py-2 text-[12px] font-semibold text-[#151515] uppercase"
              style={{ letterSpacing: "0.28em" }}
            >
              Orders
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
