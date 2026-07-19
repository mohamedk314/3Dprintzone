import type { Metadata } from "next";
import RaykHeader from "@/components/rayk/RaykHeader";
import RaykFooter from "@/components/rayk/RaykFooter";
import { readSiteSettings } from "@/lib/services/site-settings";
import { resolveRaykContact } from "@/lib/services/site-settings-types";
import { absoluteUrl, jsonLdString, raykAbsoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    default: "RAYK – 3D Printed Gifts & Accessories",
    template: "%s | RAYK",
  },
  description: "RAYK offers premium 3D printed gifts and accessories. Unique handcrafted designs delivered across Egypt.",
  openGraph: {
    type: "website",
    siteName: "RAYK",
    locale: "en_EG",
    url: raykAbsoluteUrl("/rayk"),
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default async function RaykLayout({ children }: { children: React.ReactNode }) {
  const settings = await readSiteSettings();
  const contact = resolveRaykContact(settings);

  // RAYK organization schema pulls contact details from settings (with
  // fallback to the general 3dprintzone contact), so it stays accurate.
  const raykJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${raykAbsoluteUrl("/rayk")}#organization`,
    name: "RAYK",
    url: raykAbsoluteUrl("/rayk"),
    description: "RAYK — custom 3D printed lighting fixtures, gifts, and decor, made in Egypt.",
    email: contact.email,
    telephone: contact.phone,
    parentOrganization: { "@id": `${absoluteUrl("/")}#organization` },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Cairo",
      addressCountry: "EG",
    },
    sameAs: [contact.instagramUrl].filter(Boolean),
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(raykJsonLd) }}
      />
      <RaykHeader />
      <main>{children}</main>
      <RaykFooter />
    </div>
  );
}
