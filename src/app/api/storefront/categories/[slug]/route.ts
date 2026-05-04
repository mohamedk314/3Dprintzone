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

    const category = await prisma.category.findUnique({
      where: { slug, isActive: true },
      select: {
        id:          true,
        name:        true,
        slug:        true,
        description: true,
        products: {
          where: { isActive: true },
          orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
          select: {
            id:               true,
            name:             true,
            slug:             true,
            shortDescription: true,
            price:            true,
            compareAtPrice:   true,
            stockQty:         true,
            productType:      true,
            isFeatured:       true,
            images: {
              where:   { isPrimary: true },
              select:  { imageUrl: true, altText: true },
              take:    1,
            },
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: category });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
