import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import ProductDetailPageClient from "./_client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    select: {
      name: true,
      shortDescription: true,
      description: true,
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        select: { imageUrl: true },
        take: 1,
      },
    },
  });

  if (!product) return { title: "Product Not Found" };

  const desc = product.shortDescription ?? (product.description ? product.description.slice(0, 155) : `Buy ${product.name} at 3Dprintzone. Quality 3D printed products delivered across Egypt.`);
  const image = product.images[0]?.imageUrl;

  return {
    title: product.name,
    description: desc,
    openGraph: {
      title: product.name,
      description: desc,
      type: "website",
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    select: {
      name: true,
      shortDescription: true,
      description: true,
      price: true,
      stockQty: true,
      productType: true,
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        select: { imageUrl: true },
        take: 1,
      },
    },
  });

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const desc = product?.shortDescription ?? (product?.description ? product.description.slice(0, 155) : undefined);
  const image = product?.images[0]?.imageUrl;

  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: desc,
        image,
        brand: { "@type": "Brand", name: "3Dprintzone" },
        offers: {
          "@type": "Offer",
          price: Number(product.price).toFixed(2),
          priceCurrency: "EGP",
          availability:
            product.productType === "physical" && product.stockQty === 0
              ? "https://schema.org/OutOfStock"
              : "https://schema.org/InStock",
          url: `${base}/product/${slug}`,
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetailPageClient />
    </>
  );
}
