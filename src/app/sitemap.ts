import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";
import { getSiteUrl, raykAbsoluteUrl } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  // Only active (public) products and categories are listed. New products
  // added from the admin appear here automatically; deactivated ones drop out.
  let products: { slug: string; brand: string; updatedAt: Date }[] = [];
  let categories: { slug: string; brand: string; updatedAt: Date }[] = [];
  try {
    [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        select: { slug: true, brand: true, updatedAt: true },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        select: { slug: true, brand: true, updatedAt: true },
      }),
    ]);
  } catch {
    // If the DB is unreachable, still serve the static pages instead of a 500.
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: raykAbsoluteUrl("/rayk"), lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: raykAbsoluteUrl("/rayk/shop"), lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/custom-request`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/refund-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/shipping-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: raykAbsoluteUrl("/rayk/contact"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: raykAbsoluteUrl("/rayk/privacy-policy"), lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: raykAbsoluteUrl("/rayk/terms"), lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: raykAbsoluteUrl("/rayk/refund-policy"), lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: raykAbsoluteUrl("/rayk/shipping-policy"), lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: p.brand === "rayk" ? raykAbsoluteUrl(`/rayk/product/${p.slug}`) : `${base}/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: c.brand === "rayk" ? raykAbsoluteUrl(`/rayk/category/${c.slug}`) : `${base}/category/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...categoryPages];
}
