import type { Metadata } from "next";
import HomePageClient from "./_client";

export const metadata: Metadata = {
  title: "3Dprintzone – Premium 3D Printing in Egypt",
  description: "Shop 3D printed products, order custom models, and track your orders. Fast delivery across Egypt. COD & InstaPay accepted.",
  openGraph: {
    title: "3Dprintzone – Premium 3D Printing in Egypt",
    description: "Shop 3D printed products, order custom models, and track your orders. Fast delivery across Egypt.",
    type: "website",
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
