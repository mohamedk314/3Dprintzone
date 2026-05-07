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
      id:               true,
      name:             true,
      slug:             true,
      price:            true,
      compareAtPrice:   true,
      stockQty:         true,
      productType:      true,
      images: {
        where:  { isPrimary: true },
        select: { imageUrl: true, altText: true },
        take:   1,
      },
    },
  },
} as const;

export async function GET(req: NextRequest) {
  try {
    const sessionId = await getOrCreateSessionId();
    const brand = req.nextUrl.searchParams.get("brand") ?? "3dprintzone";

    const wishlist = await prisma.wishlist.findUnique({
      where:  { sessionId_brand: { sessionId, brand } },
      select: { id: true, items: { select: wishlistItemSelect, orderBy: { createdAt: "desc" } } },
    });

    return NextResponse.json({
      success: true,
      data: { items: wishlist?.items ?? [], itemCount: wishlist?.items.length ?? 0 },
    });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionId = await getOrCreateSessionId();
    const body      = await req.json();
    const { productId, brand = "3dprintzone" } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json({ success: false, message: "productId is required" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where:  { id: productId, isActive: true },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    const wishlist = await prisma.wishlist.upsert({
      where:  { sessionId_brand: { sessionId, brand } },
      create: { sessionId, brand },
      update: {},
      select: { id: true },
    });

    await prisma.wishlistItem.upsert({
      where:  { wishlistId_productId: { wishlistId: wishlist.id, productId } },
      create: { wishlistId: wishlist.id, productId },
      update: {},
    });

    const updated = await prisma.wishlist.findUnique({
      where:  { sessionId_brand: { sessionId, brand } },
      select: { id: true, items: { select: wishlistItemSelect, orderBy: { createdAt: "desc" } } },
    });

    return NextResponse.json({
      success: true,
      data: { items: updated!.items, itemCount: updated!.items.length },
    });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
