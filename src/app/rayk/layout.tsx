import type { Metadata } from "next";
import RaykHeader from "@/components/rayk/RaykHeader";
import RaykFooter from "@/components/rayk/RaykFooter";

export const metadata: Metadata = {
  title: "RAYK",
  description: "RAYK – Premium fashion and lifestyle.",
};

export default function RaykLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-black">
      <RaykHeader />
      <main>{children}</main>
      <RaykFooter />
    </div>
  );
}
