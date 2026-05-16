import type { Metadata } from "next";
import { readSiteSettings } from "@/lib/services/site-settings";
import RaykHomePageClient from "./_client";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await readSiteSettings();
  const seo = settings.rayk.seo;
  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    openGraph: {
      title: seo.metaTitle,
      description: seo.metaDescription,
      type: "website",
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
  };
}

export default function RaykHomePage() {
  return <RaykHomePageClient />;
}
