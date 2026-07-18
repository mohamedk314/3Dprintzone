import type { Metadata } from "next";
import { jsonLdString } from "@/lib/seo";
import CustomRequestPageClient from "./_client";

export const metadata: Metadata = {
  title: "Custom 3D Printing Request",
  description: "Order a custom 3D print in Egypt — architecture scale models, personalized gifts, dental models, prototypes, and mechanical parts. Send your design and get a quote.",
  alternates: { canonical: "/custom-request" },
  openGraph: {
    title: "Custom 3D Printing Request | 3Dprintzone",
    description: "Order a custom 3D print in Egypt — architecture models, personalized gifts, dental models, prototypes, and mechanical parts.",
    type: "website",
    url: "/custom-request",
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom 3D Printing Request | 3Dprintzone",
    description: "Order a custom 3D print in Egypt — architecture models, personalized gifts, dental models, prototypes, and mechanical parts.",
  },
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Custom 3D Printing",
  serviceType: "3D printing service",
  description:
    "Custom 3D printing on request: architecture scale models, personalized gifts, dental models, prototypes, and mechanical parts. Submit a design or a description and receive a quote.",
  areaServed: { "@type": "Country", name: "Egypt" },
  provider: { "@type": "Organization", name: "3Dprintzone" },
};

export default function CustomRequestPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(serviceJsonLd) }}
      />
      <CustomRequestPageClient />
    </>
  );
}
