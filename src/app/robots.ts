import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private, transactional, or account pages — never useful in search
        // results. Product, category, shop, RAYK, and legal pages stay open.
        disallow: [
          "/admin",
          "/api",
          "/account",
          "/cart",
          "/checkout",
          "/wishlist",
          "/track-order",
          "/rayk/cart",
          "/rayk/checkout",
          "/rayk/wishlist",
          "/rayk/track-order",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
