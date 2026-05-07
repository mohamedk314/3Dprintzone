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
    id: string;
    name: string;
    slug: string;
    stockQty: number;
    productType: string;
    isActive: boolean;
    images: { imageUrl: string; altText: string | null }[];
  };
}[]) {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.qty,
    0
  );
  return { items, subtotal: subtotal.toFixed(2), itemCount: items.reduce((s, i) => s + i.qty, 0) };
}

export async function GET(req: NextRequest) {
  try {
    const sessionId = await getOrCreateSessionId();
    const brand = req.nextUrl.searchParams.get("brand") ?? "3dprintzone";

    const cart = await prisma.cart.findUnique({
      where: { sessionId_brand: { sessionId, brand } },
      select: { id: true, items: { select: cartItemSelect } },
    });

    if (!cart) {
      return NextResponse.json({ success: true, data: buildCartResponse([]) });
    }

    return NextResponse.json({ success: true, data: buildCartResponse(cart.items) });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionId = await getOrCreateSessionId();
    const body = await req.json();
    const { productId, qty = 1, brand = "3dprintzone" } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json({ success: false, message: "productId is required" }, { status: 400 });
    }

    const parsedQty = Number(qty);
    if (!Number.isInteger(parsedQty) || parsedQty < 1) {
      return NextResponse.json({ success: false, message: "qty must be a positive integer" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true },
      select: { id: true, price: true, stockQty: true, productType: true },
    });

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    if (product.productType === "physical" && product.stockQty < parsedQty) {
      return NextResponse.json(
        { success: false, message: "Insufficient stock" },
        { status: 422 }
      );
    }

    const cart = await prisma.cart.upsert({
      where:  { sessionId_brand: { sessionId, brand } },
      create: { sessionId, brand },
      update: {},
      select: { id: true },
    });

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
      select: { id: true, qty: true },
    });

    const newQty = (existingItem?.qty ?? 0) + parsedQty;

    if (product.productType === "physical" && product.stockQty < newQty) {
      return NextResponse.json(
        { success: false, message: `Only ${product.stockQty} units available` },
        { status: 422 }
      );
    }

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data:  { qty: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId:    cart.id,
          productId,
          qty:       parsedQty,
          unitPrice: product.price,
        },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where:  { sessionId_brand: { sessionId, brand } },
      select: { id: true, items: { select: cartItemSelect } },
    });

    return NextResponse.json({
      success: true,
      data: buildCartResponse(updatedCart!.items),
    });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
