import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import StorefrontChrome from "@/components/layout/StorefrontChrome";
import MaintenancePage from "@/components/maintenance/MaintenancePage";
import { readSiteSettings } from "@/lib/services/site-settings";

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

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased bg-gray-50`} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {maintenanceActive ? (
          <MaintenancePage maintenance={settings.maintenance} />
        ) : (
          <StorefrontChrome>{children}</StorefrontChrome>
        )}
      </body>
    </html>
  );
}
