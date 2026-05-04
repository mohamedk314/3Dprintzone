import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      select: {
        id:               true,
        name:             true,
        slug:             true,
        shortDescription: true,
        description:      true,
        sku:              true,
        price:            true,
        compareAtPrice:   true,
        stockQty:         true,
        lowStockThreshold: true,
        productType:      true,
        isFeatured:       true,
        createdAt:        true,
        category:         { select: { name: true, slug: true } },
        images: {
          orderBy: { sortOrder: "asc" },
          select:  { id: true, imageUrl: true, altText: true, isPrimary: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
