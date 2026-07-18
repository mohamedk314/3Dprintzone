import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import StorefrontChrome from "@/components/layout/StorefrontChrome";
import FloatingContactButton from "@/components/FloatingContactButton";
import MaintenancePage from "@/components/maintenance/MaintenancePage";
import { readSiteSettings } from "@/lib/services/site-settings";
import { absoluteUrl, getSiteUrl, jsonLdString } from "@/lib/seo";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

const SITE_URL = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "3Dprintzone – Premium 3D Printing in Egypt",
    template: "%s | 3Dprintzone",
  },
  description: "Shop 3D printed products, order custom models, and track your orders. Trusted 3D printing services in Egypt.",
  applicationName: "3Dprintzone",
  openGraph: {
    type: "website",
    siteName: "3Dprintzone",
    locale: "en_EG",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "3Dprintzone – Premium 3D Printing in Egypt",
    description: "Shop 3D printed products, order custom models, and track your orders. Trusted 3D printing services in Egypt.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Paths that bypass the maintenance gate even when the toggle is on.
 * Admins must always be able to reach login + dashboard, admin APIs must keep
 * functioning so the super admin can turn maintenance back off, and static
 * assets need to load so the maintenance page itself renders correctly.
 */
function shouldBypassMaintenance(pathname: string): boolean {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/customer/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icon") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico")
  );
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await readSiteSettings();

  // The pathname header is attached by `src/proxy.ts` on every request.
  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-pathname") ?? "/";

  const maintenanceActive =
    settings.maintenance.enabled && !shouldBypassMaintenance(pathname);

  // Organization schema is built from settings so contact details stay in
  // sync with what the admin publishes on the Contact page.
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "3Dprintzone",
    url: SITE_URL,
    logo: absoluteUrl("/icon.png"),
    description: "3D printing store and custom 3D printing service in Egypt.",
    email: settings.contact.email,
    telephone: settings.contact.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Cairo",
      addressCountry: "EG",
    },
    sameAs: [settings.contact.instagramUrl].filter(Boolean),
  };

  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "3Dprintzone",
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en",
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased bg-gray-50`} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(webSiteJsonLd) }}
        />
        {maintenanceActive ? (
          <MaintenancePage maintenance={settings.maintenance} />
        ) : (
          <>
            <StorefrontChrome>{children}</StorefrontChrome>
            <FloatingContactButton />
          </>
        )}
      </body>
    </html>
  );
}
