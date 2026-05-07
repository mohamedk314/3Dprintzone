import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import RaykCategoryPageClient from "./_client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findFirst({
    where: { slug, isActive: true, brand: "rayk" },
    select: { name: true, description: true },
  });

  if (!category) return { title: "Category Not Found" };

  const desc = category.description ?? `Browse ${category.name} gifts and accessories by RAYK.`;
  return {
    title: category.name,
    description: desc,
    openGraph: {
      title: `${category.name} | RAYK`,
      description: desc,
      type: "website",
    },
  };
}

export default function RaykCategoryPage() {
  return <RaykCategoryPageClient />;
}
