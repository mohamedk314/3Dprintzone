import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import CategoryPageClient from "./_client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findFirst({
    where: { slug, isActive: true, brand: "3dprintzone" },
    select: { name: true, description: true },
  });

  if (!category) return { title: "Category Not Found" };

  const desc = category.description ?? `Browse ${category.name} products at 3Dprintzone. 3D printed items delivered across Egypt.`;
  return {
    title: category.name,
    description: desc,
    openGraph: {
      title: `${category.name} | 3Dprintzone`,
      description: desc,
      type: "website",
    },
  };
}

export default function CategoryPage() {
  return <CategoryPageClient />;
}
