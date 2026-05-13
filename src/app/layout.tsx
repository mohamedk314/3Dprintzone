import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import StorefrontChrome from "@/components/layout/StorefrontChrome";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://3dprintzone.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "3Dprintzone – Premium 3D Printing in Egypt",
    template: "%s | 3Dprintzone",
  },
  description: "Shop 3D printed products, order custom models, and track your orders. Trusted 3D printing services in Egypt.",
  openGraph: {
    type: "website",
    siteName: "3Dprintzone",
    locale: "en_EG",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "3Dprintzone",
  url: APP_URL,
  description: "Premium 3D printing services in Egypt.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Cairo",
    addressCountry: "EG",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased bg-gray-50`} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <StorefrontChrome>{children}</StorefrontChrome>
      </body>
    </html>
  );
}
