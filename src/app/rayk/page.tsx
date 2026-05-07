import type { Metadata } from "next";
import RaykHomePageClient from "./_client";

export const metadata: Metadata = {
  title: "RAYK – 3D Printed Gifts & Accessories",
  description: "Discover unique 3D printed gifts and accessories by RAYK. Premium quality, delivered across Egypt.",
  openGraph: {
    title: "RAYK – 3D Printed Gifts & Accessories",
    description: "Discover unique 3D printed gifts and accessories by RAYK. Premium quality, delivered across Egypt.",
    type: "website",
  },
};

export default function RaykHomePage() {
  return <RaykHomePageClient />;
}
