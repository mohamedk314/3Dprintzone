import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readSiteSettings } from "@/lib/services/site-settings";
import { pageMetadata } from "@/lib/seo";
import LegalArticle from "@/components/legal/LegalArticle";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { legalPages } = await readSiteSettings();
  const page = legalPages["shipping-policy"];
  return pageMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    canonical: "/shipping-policy",
  });
}

export default async function ShippingPolicyPage() {
  const { legalPages } = await readSiteSettings();
  const page = legalPages["shipping-policy"];
  if (!page.enabled) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-600">{page.title}</span>
      </nav>
      <LegalArticle title={page.title} body={page.body} />
    </div>
  );
}
