"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import TopBar from "./TopBar";
import Header from "./Header";
import CategoryNav from "./CategoryNav";
import Footer from "./Footer";

export default function StorefrontChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isRayk  = pathname.startsWith("/rayk");

  if (isAdmin || isRayk) return <>{children}</>;

  return (
    <>
      <TopBar />
      <Header />
      <Suspense>
        <CategoryNav />
      </Suspense>
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
