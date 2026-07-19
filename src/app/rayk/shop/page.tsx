import type { Metadata } from "next";
import { raykAbsoluteUrl } from "@/lib/seo";
import RaykShopPageClient from "./_client";

export const metadata: Metadata = {
  title: "Shop – 3D Printed Lighting & Decor",
  description: "Browse the full RAYK collection — custom 3D printed lighting fixtures, gifts, and decor. Delivered across Egypt.",
  alternates: { canonical: raykAbsoluteUrl("/rayk/shop") },
  openGraph: {
    title: "Shop 3D Printed Lighting & Decor | RAYK",
    description: "Browse the full RAYK collection — custom 3D printed lighting fixtures, gifts, and decor. Delivered across Egypt.",
    type: "website",
    url: raykAbsoluteUrl("/rayk/shop"),
    siteName: "RAYK",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop 3D Printed Lighting & Decor | RAYK",
    description: "Browse the full RAYK collection — custom 3D printed lighting fixtures, gifts, and decor.",
  },
};

export default function RaykShopPage() {
  return <RaykShopPageClient />;
}
