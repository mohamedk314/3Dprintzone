import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import StorefrontChrome from "@/components/layout/StorefrontChrome";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "3Dprintzone – Premium 3D Printing in Egypt",
  description: "Shop 3D printed products, order custom models, and track your orders. Trusted 3D printing services in Egypt.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased bg-gray-50`}>
        <StorefrontChrome>{children}</StorefrontChrome>
      </body>
    </html>
  );
}
