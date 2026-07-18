import type { Metadata } from "next";
import { cache } from "react";
import { prisma } from "@/lib/db/prisma";
import { absoluteUrl, breadcrumbJsonLd, jsonLdString, truncateAtWord } from "@/lib/seo";
import RaykCategoryPageClient from "./_client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

const getCategory = cache(async (slug: string) =>
  prisma.category.findFirst({
    where: { slug, isActive: true, brand: "rayk" },
    select: { name: true, description: true, imageUrl: true },
  })
);

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) return { title: "Category Not Found", robots: { index: false } };

  const desc = truncateAtWord(
    category.description ??
      `Browse ${category.name} — 3D printed lighting and decor by RAYK, delivered across Egypt.`,
    170
  );
  const canonical = `/rayk/category/${slug}`;

  return {
    title: category.name,
    description: desc,
    alternates: { canonical },
    openGraph: {
      title: `${category.name} | RAYK`,
      description: desc,
      type: "website",
      url: canonical,
      siteName: "RAYK",
      images: category.imageUrl
        ? [{ url: category.imageUrl, alt: `${category.name} — RAYK` }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.name} | RAYK`,
      description: desc,
      images: category.imageUrl ? [category.imageUrl] : undefined,
    },
  };
}

export default async function RaykCategoryPage({ params }: Params) {
  const { slug } = await params;
  const category = await getCategory(slug);

  const collectionJsonLd = category
    ? {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: category.name,
        description:
          category.description ?? `${category.name} — 3D printed lighting and decor by RAYK.`,
        url: absoluteUrl(`/rayk/category/${slug}`),
      }
    : null;

  const breadcrumbs = category
    ? breadcrumbJsonLd([
        { name: "RAYK", path: "/rayk" },
        { name: "Shop", path: "/rayk/shop" },
        { name: category.name, path: `/rayk/category/${slug}` },
      ])
    : null;

  return (
    <>
      {collectionJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(collectionJsonLd) }}
        />
      )}
      {breadcrumbs && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumbs) }}
        />
      )}
      <RaykCategoryPageClient />
    </>
  );
}
