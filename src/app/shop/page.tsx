import type { Metadata } from "next";
import ShopPageClient from "./_client";

export const metadata: Metadata = {
  title: "Shop – Browse All Products",
  description: "Browse our full range of 3D printed products. Filter by category, price range, and availability. Fast delivery across Egypt.",
  alternates: { canonical: "/shop" },
  openGraph: {
    title: "Shop 3D Printed Products | 3Dprintzone",
    description: "Browse our full range of 3D printed products. Filter by category, price range, and availability.",
    type: "website",
    url: "/shop",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop 3D Printed Products | 3Dprintzone",
    description: "Browse our full range of 3D printed products. Filter by category, price range, and availability.",
  },
};

export default function ShopPage() {
  return <ShopPageClient />;
}
