import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getOrCreateSessionId } from "@/lib/utils/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const cartItemSelect = {
  id:        true,
  qty:       true,
  unitPrice: true,
  product: {
    select: {
      id:          true,
      name:        true,
      slug:        true,
      stockQty:    true,
      productType: true,
      isActive:    true,
      images: {
        where:  { isPrimary: true },
        select: { imageUrl: true, altText: true },
        take:   1,
      },
    },
  },
} as const;

function buildCartResponse(items: {
  id: string;
  qty: number;
  unitPrice: { toString(): string };
  product: {
    id: string; name: string; slug: string;
    stockQty: number; productType: string; isActive: boolean;
    images: { imageUrl: string; altText: string | null }[];
  };
}[]) {
  const subtotal = items.reduce((sum, i) => sum + Number(i.unitPrice) * i.qty, 0);
  return { items, subtotal: subtotal.toFixed(2), itemCount: items.reduce((s, i) => s + i.qty, 0) };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const sessionId       = await getOrCreateSessionId();
    const { productId }   = await params;
    const body            = await req.json();
    const parsedQty       = Number(body.qty);
    const brand           = (body.brand as string) ?? req.nextUrl.searchParams.get("brand") ?? "3dprintzone";

    if (!Number.isInteger(parsedQty) || parsedQty < 0) {
      return NextResponse.json(
        { success: false, message: "qty must be a non-negative integer" },
        { status: 400 }
      );
    }

    const cart = await prisma.cart.findUnique({
      where:  { sessionId_brand: { sessionId, brand } },
      select: { id: true },
    });

    if (!cart) {
      return NextResponse.json({ success: false, message: "Cart not found" }, { status: 404 });
    }

    const item = await prisma.cartItem.findUnique({
      where:  { cartId_productId: { cartId: cart.id, productId } },
      select: { id: true },
    });

    if (!item) {
      return NextResponse.json({ success: false, message: "Item not in cart" }, { status: 404 });
    }

    if (parsedQty === 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      const product = await prisma.product.findUnique({
        where:  { id: productId },
        select: { stockQty: true, productType: true },
      });
      if (product?.productType === "physical" && product.stockQty < parsedQty) {
        return NextResponse.json(
          { success: false, message: `Only ${product.stockQty} units available` },
          { status: 422 }
        );
      }
      await prisma.cartItem.update({ where: { id: item.id }, data: { qty: parsedQty } });
    }

    const updatedCart = await prisma.cart.findUnique({
      where:  { sessionId_brand: { sessionId, brand } },
      select: { id: true, items: { select: cartItemSelect } },
    });

    return NextResponse.json({ success: true, data: buildCartResponse(updatedCart!.items) });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const sessionId     = await getOrCreateSessionId();
    const { productId } = await params;
    const brand         = req.nextUrl.searchParams.get("brand") ?? "3dprintzone";

    const cart = await prisma.cart.findUnique({
      where:  { sessionId_brand: { sessionId, brand } },
      select: { id: true },
    });

    if (!cart) {
      return NextResponse.json({ success: false, message: "Cart not found" }, { status: 404 });
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });

    const updatedCart = await prisma.cart.findUnique({
      where:  { sessionId_brand: { sessionId, brand } },
      select: { id: true, items: { select: cartItemSelect } },
    });

    return NextResponse.json({ success: true, data: buildCartResponse(updatedCart!.items) });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
