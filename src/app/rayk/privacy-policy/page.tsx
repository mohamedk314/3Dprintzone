import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readSiteSettings } from "@/lib/services/site-settings";
import { pageMetadata, raykAbsoluteUrl } from "@/lib/seo";
import RaykLegalArticle from "@/components/legal/RaykLegalArticle";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await readSiteSettings();
  const page = settings.rayk.legalPages["privacy-policy"];
  return pageMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    canonical: raykAbsoluteUrl("/rayk/privacy-policy"), siteName: "RAYK",
  });
}

export default async function RaykPrivacyPolicyPage() {
  const settings = await readSiteSettings();
  const page = settings.rayk.legalPages["privacy-policy"];
  if (!page.enabled) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14" style={{ background: "#F7F6F2" }}>
      <nav
        className="mb-6 flex items-center gap-2 text-[10px] font-semibold uppercase"
        style={{ color: "#A6A29A", letterSpacing: "0.3em" }}
      >
        <Link href="/rayk" className="hover:text-black transition-colors">RAYK</Link>
        <span>/</span>
        <span style={{ color: "#151515" }}>{page.title}</span>
      </nav>
      <RaykLegalArticle title={page.title} body={page.body} />
    </div>
  );
}
