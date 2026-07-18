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
import ProductDetailPageClient from "./_client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

// cache() dedupes the query between generateMetadata and the page render.
const getProduct = cache(async (slug: string) =>
  prisma.product.findFirst({
    where: { slug, isActive: true },
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
  const desc = productSeoDescription(seoSource, "3Dprintzone");
  const image = product.images[0];
  const canonical = `/product/${slug}`;

  return {
    title,
    description: desc,
    keywords: productSeoKeywords(seoSource, BRAND_KEYWORD_THEMES["3dprintzone"]),
    alternates: { canonical },
    openGraph: {
      title,
      description: desc,
      type: "website",
      url: canonical,
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

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProduct(slug);

  const url = absoluteUrl(`/product/${slug}`);

  const productJsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: productSeoDescription(
          { ...product, categoryName: product.category?.name },
          "3Dprintzone"
        ),
        image: product.images.map((img) => absoluteUrl(img.imageUrl)),
        sku: product.sku ?? undefined,
        category: product.category?.name,
        url,
        brand: { "@type": "Brand", name: "3Dprintzone" },
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
        { name: "Home", path: "/" },
        { name: "Shop", path: "/shop" },
        ...(product.category
          ? [{ name: product.category.name, path: `/category/${product.category.slug}` }]
          : []),
        { name: product.name, path: `/product/${slug}` },
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
      <ProductDetailPageClient />
    </>
  );
}
