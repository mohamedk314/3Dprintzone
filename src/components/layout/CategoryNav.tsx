"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface Category { id: string; name: string; slug: string; }

export default function CategoryNav() {
  const [categories, setCategories] = useState<Category[]>([]);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "";

  useEffect(() => {
    fetch("/api/storefront/categories", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setCategories(d?.data ?? []))
      .catch(() => {});
  }, []);

  const isActive = (slug: string) => {
    if (pathname.startsWith(`/category/`)) return pathname === `/category/${slug}`;
    return activeCategory === slug;
  };

  // Stable 2px bottom border on every tab — color animates from transparent → indigo.
  // This eliminates the layout shift the previous hover-only border caused.
  const tabBase =
    "shrink-0 px-3.5 sm:px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 border-transparent transition-[color,border-color] duration-200";

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {/* All products link */}
          <Link
            href="/shop"
            className={`${tabBase} ${
              pathname === "/shop" && !activeCategory
                ? "text-indigo-600 border-indigo-600"
                : "text-gray-600 hover:text-indigo-600 hover:border-indigo-200"
            }`}
          >
            All Products
          </Link>
          {/* RAYK brand link */}
          <Link
            href="/rayk"
            className={`${tabBase} font-black tracking-[0.18em] uppercase ${
              pathname.startsWith("/rayk")
                ? "text-black border-black"
                : "text-gray-500 hover:text-black hover:border-gray-300"
            }`}
          >
            RAYK
          </Link>
          {/* Static links */}
          <Link
            href="/custom-request"
            className={`${tabBase} ${
              pathname === "/custom-request"
                ? "text-indigo-600 border-indigo-600"
                : "text-gray-600 hover:text-indigo-600 hover:border-indigo-200"
            }`}
          >
            Custom Request
          </Link>
          <Link
            href="/track-order"
            className={`${tabBase} ${
              pathname === "/track-order"
                ? "text-indigo-600 border-indigo-600"
                : "text-gray-600 hover:text-indigo-600 hover:border-indigo-200"
            }`}
          >
            Track Order
          </Link>
          {/* Separator */}
          {categories.length > 0 && <div className="w-px h-5 bg-gray-200 mx-1 shrink-0 self-center" />}
          {/* Dynamic categories */}
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className={`${tabBase} ${
                isActive(cat.slug)
                  ? "text-indigo-600 border-indigo-600"
                  : "text-gray-600 hover:text-indigo-600 hover:border-indigo-200"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
