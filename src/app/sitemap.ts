import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://3dprintzone.com";

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, brand: true, updatedAt: true },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, brand: true, updatedAt: true },
    }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/rayk`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/rayk/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/custom-request`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: p.brand === "rayk" ? `${base}/rayk/product/${p.slug}` : `${base}/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: c.brand === "rayk" ? `${base}/rayk/category/${c.slug}` : `${base}/category/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...categoryPages];
}
