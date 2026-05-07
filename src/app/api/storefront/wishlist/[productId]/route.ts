import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getOrCreateSessionId } from "@/lib/utils/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const wishlistItemSelect = {
  id:        true,
  createdAt: true,
  product: {
    select: {
      id:             true,
      name:           true,
      slug:           true,
      price:          true,
      compareAtPrice: true,
      stockQty:       true,
      productType:    true,
      images: {
        where:  { isPrimary: true },
        select: { imageUrl: true, altText: true },
        take:   1,
      },
    },
  },
} as const;

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const sessionId     = await getOrCreateSessionId();
    const { productId } = await params;
    const brand         = req.nextUrl.searchParams.get("brand") ?? "3dprintzone";

    const wishlist = await prisma.wishlist.findUnique({
      where:  { sessionId_brand: { sessionId, brand } },
      select: { id: true },
    });

    if (wishlist) {
      await prisma.wishlistItem.deleteMany({
        where: { wishlistId: wishlist.id, productId },
      });
    }

    const updated = await prisma.wishlist.findUnique({
      where:  { sessionId_brand: { sessionId, brand } },
      select: { id: true, items: { select: wishlistItemSelect, orderBy: { createdAt: "desc" } } },
    });

    return NextResponse.json({
      success: true,
      data: { items: updated?.items ?? [], itemCount: updated?.items.length ?? 0 },
    });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
