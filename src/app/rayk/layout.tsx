import type { Metadata } from "next";
import RaykHeader from "@/components/rayk/RaykHeader";
import RaykFooter from "@/components/rayk/RaykFooter";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://3dprintzone.com";

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
    url: `${APP_URL}/rayk`,
  },
};

const raykJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "RAYK",
  url: `${APP_URL}/rayk`,
  description: "Premium 3D printed gifts and accessories in Egypt.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Cairo",
    addressCountry: "EG",
  },
};

export default function RaykLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(raykJsonLd) }}
      />
      <RaykHeader />
      <main>{children}</main>
      <RaykFooter />
    </div>
  );
}
