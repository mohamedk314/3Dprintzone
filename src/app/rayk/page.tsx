import type { Metadata } from "next";
import { readSiteSettings } from "@/lib/services/site-settings";
import { absoluteUrl, jsonLdString } from "@/lib/seo";
import RaykHomePageClient from "./_client";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await readSiteSettings();
  const seo = settings.rayk.seo;
  return {
    title: { absolute: seo.metaTitle },
    description: seo.metaDescription,
    alternates: { canonical: "/rayk" },
    openGraph: {
      title: seo.metaTitle,
      description: seo.metaDescription,
      type: "website",
      url: "/rayk",
      siteName: "RAYK",
      images: seo.ogImage
        ? [{ url: seo.ogImage, alt: settings.rayk.hero.backgroundImageAlt }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.metaTitle,
      description: seo.metaDescription,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
  };
}

export default async function RaykHomePage() {
  const settings = await readSiteSettings();
  const seo = settings.rayk.seo;

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: seo.metaTitle,
    description: seo.metaDescription,
    url: absoluteUrl("/rayk"),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(webPageJsonLd) }}
      />
      <RaykHomePageClient />
    </>
  );
}
