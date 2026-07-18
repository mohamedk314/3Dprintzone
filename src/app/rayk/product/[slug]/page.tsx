import type { Metadata } from "next";
import { cache } from "react";
import { prisma } from "@/lib/db/prisma";
import {
  BRAND_KEYWORD_THEMES,
  absoluteUrl,
  breadcrumbJsonLd,
  jsonLdString,
  productImageAlt,
  productSeoDescription,
  productSeoKeywords,
  productSeoTitle,
} from "@/lib/seo";
import RaykProductPageClient from "./_client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

// cache() dedupes the query between generateMetadata and the page render.
const getProduct = cache(async (slug: string) =>
  prisma.product.findFirst({
    where: { slug, isActive: true, brand: "rayk" },
    select: {
      name: true,
      shortDescription: true,
      description: true,
      seoTitle: true,
      seoDescription: true,
      seoKeywords: true,
      sku: true,
      price: true,
      stockQty: true,
      productType: true,
      category: { select: { name: true, slug: true } },
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        select: { imageUrl: true, altText: true },
        take: 4,
      },
    },
  })
);

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) return { title: "Product Not Found", robots: { index: false } };

  const seoSource = { ...product, categoryName: product.category?.name };
  const title = productSeoTitle(seoSource);
  const desc = productSeoDescription(seoSource, "RAYK");
  const image = product.images[0];
  const canonical = `/rayk/product/${slug}`;

  return {
    title,
    description: desc,
    keywords: productSeoKeywords(seoSource, BRAND_KEYWORD_THEMES["rayk"]),
    alternates: { canonical },
    openGraph: {
      title,
      description: desc,
      type: "website",
      url: canonical,
      siteName: "RAYK",
      images: image
        ? [{ url: image.imageUrl, alt: productImageAlt(product.name, image.altText) }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: image ? [image.imageUrl] : undefined,
    },
  };
}

export default async function RaykProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProduct(slug);

  const url = absoluteUrl(`/rayk/product/${slug}`);

  const productJsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: productSeoDescription(
          { ...product, categoryName: product.category?.name },
          "RAYK"
        ),
        image: product.images.map((img) => absoluteUrl(img.imageUrl)),
        sku: product.sku ?? undefined,
        category: product.category?.name,
        url,
        brand: { "@type": "Brand", name: "RAYK" },
        offers: {
          "@type": "Offer",
          price: Number(product.price).toFixed(2),
          priceCurrency: "EGP",
          availability:
            product.productType === "physical" && product.stockQty === 0
              ? "https://schema.org/OutOfStock"
              : "https://schema.org/InStock",
          url,
        },
      }
    : null;

  const breadcrumbs = product
    ? breadcrumbJsonLd([
        { name: "RAYK", path: "/rayk" },
        { name: "Shop", path: "/rayk/shop" },
        ...(product.category
          ? [{ name: product.category.name, path: `/rayk/category/${product.category.slug}` }]
          : []),
        { name: product.name, path: `/rayk/product/${slug}` },
      ])
    : null;

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(productJsonLd) }}
        />
      )}
      {breadcrumbs && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumbs) }}
        />
      )}
      <RaykProductPageClient />
    </>
  );
}
