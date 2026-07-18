import type { Metadata } from "next";
import Link from "next/link";
import HomePageClient from "./_client";
import { readSiteSettings } from "@/lib/services/site-settings";
import { absoluteUrl, jsonLdString } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await readSiteSettings();
  const seo = settings.printzoneSeo;
  return {
    title: { absolute: seo.metaTitle },
    description: seo.metaDescription,
    alternates: { canonical: "/" },
    openGraph: {
      title: seo.metaTitle,
      description: seo.metaDescription,
      type: "website",
      url: "/",
      images: seo.ogImage ? [{ url: seo.ogImage, alt: settings.hero.printerImageAlt }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.metaTitle,
      description: seo.metaDescription,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
  };
}

/**
 * Server-rendered answer-style content for search engines and AI assistants.
 * The interactive homepage above fetches its content client-side, so this
 * section is the crawlable source of truth about what the business does.
 */
const FAQS = [
  {
    q: "What does 3Dprintzone sell?",
    a: "3Dprintzone is a 3D printing store in Egypt. We sell ready-made 3D printed products — home decor, desk accessories, figurines, and engineering parts — and take fully custom 3D printing requests for architecture models, personalized gifts, dental models, and mechanical parts.",
  },
  {
    q: "How does ordering work?",
    a: "Browse the shop, add products to your cart, and check out with your delivery address. You can pay cash on delivery (COD) or via InstaPay. After ordering you can follow your delivery from the Track Order page using your order reference.",
  },
  {
    q: "Do you deliver across Egypt?",
    a: "Yes. We deliver across Egypt, and standard delivery typically takes 2–5 business days after the order is confirmed. The exact shipping fee for your area is shown at checkout.",
  },
  {
    q: "Can I order a custom 3D print?",
    a: "Yes. Submit a custom request describing what you need — or attach a reference — and we will get back to you with a quote. We handle architecture scale models, personalized gifts, dental models, prototypes, and mechanical parts.",
  },
];

function GeoContentSection() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section
      aria-labelledby="about-3dprintzone"
      className="max-w-7xl mx-auto px-4 sm:px-6 pb-14 sm:pb-16"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(faqJsonLd) }}
      />
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-10">
        <h2 id="about-3dprintzone" className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-3">
          3D Printing in Egypt, Made Simple
        </h2>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-3xl">
          3Dprintzone is an Egyptian 3D printing store and custom printing service. We design,
          print, and deliver 3D printed products across Egypt — from ready-made{" "}
          <Link href="/shop" className="text-indigo-600 hover:text-indigo-700 font-medium">shop items</Link>{" "}
          to fully{" "}
          <Link href="/custom-request" className="text-indigo-600 hover:text-indigo-700 font-medium">custom 3D printing requests</Link>{" "}
          like architecture models, personalized gifts, dental models, and mechanical parts.
          Payment is easy with cash on delivery or InstaPay, and every order can be followed from
          the Track Order page.
        </p>

        <dl className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
          {FAQS.map((f) => (
            <div key={f.q}>
              <dt className="text-sm font-semibold text-gray-900 mb-1.5">{f.q}</dt>
              <dd className="text-sm text-gray-500 leading-relaxed">{f.a}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 text-sm text-gray-500">
          Questions? Visit the{" "}
          <Link href="/contact" className="text-indigo-600 hover:text-indigo-700 font-medium">contact page</Link>,
          read our{" "}
          <Link href="/shipping-policy" className="text-indigo-600 hover:text-indigo-700 font-medium">shipping policy</Link>{" "}
          and{" "}
          <Link href="/refund-policy" className="text-indigo-600 hover:text-indigo-700 font-medium">refund policy</Link>,
          or explore{" "}
          <Link href="/rayk" className="text-indigo-600 hover:text-indigo-700 font-medium">RAYK</Link>{" "}
          — our 3D printed lighting and decor brand.
        </p>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const settings = await readSiteSettings();
  const seo = settings.printzoneSeo;

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: seo.metaTitle,
    description: seo.metaDescription,
    url: absoluteUrl("/"),
    isPartOf: { "@id": `${absoluteUrl("/")}#website` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(webPageJsonLd) }}
      />
      <HomePageClient />
      <GeoContentSection />
    </>
  );
}
