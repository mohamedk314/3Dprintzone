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

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0.5">
          {/* All products link */}
          <Link
            href="/shop"
            className={`shrink-0 px-4 py-2.5 text-sm font-medium rounded transition-colors whitespace-nowrap ${
              pathname === "/shop" && !activeCategory
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600 hover:text-indigo-600 hover:border-b-2 hover:border-indigo-200"
            }`}
          >
            All Products
          </Link>
          {/* Static links */}
          <Link
            href="/custom-request"
            className={`shrink-0 px-4 py-2.5 text-sm font-medium rounded transition-colors whitespace-nowrap ${
              pathname === "/custom-request"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600 hover:text-indigo-600"
            }`}
          >
            Custom Request
          </Link>
          <Link
            href="/track-order"
            className={`shrink-0 px-4 py-2.5 text-sm font-medium rounded transition-colors whitespace-nowrap ${
              pathname === "/track-order"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600 hover:text-indigo-600"
            }`}
          >
            Track Order
          </Link>
          {/* Separator */}
          {categories.length > 0 && <div className="w-px h-5 bg-gray-200 mx-1 shrink-0" />}
          {/* Dynamic categories */}
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className={`shrink-0 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                isActive(cat.slug)
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-indigo-600"
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
