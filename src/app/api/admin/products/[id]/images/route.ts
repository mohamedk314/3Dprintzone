import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedAdmin } from "@/lib/auth/admin-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuthenticatedAdmin();
    const { id } = await params;

    const images = await prisma.productImage.findMany({
      where: { productId: id },
      orderBy: { sortOrder: "asc" },
      select: { id: true, imageUrl: true, altText: true, isPrimary: true, sortOrder: true },
    });

    return NextResponse.json({ success: true, data: images });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuthenticatedAdmin();
    const { id } = await params;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    const body = await req.json();
    const { imageUrl, altText, isPrimary, sortOrder, contentType } = body;

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json({ success: false, message: "imageUrl is required" }, { status: 400 });
    }

    if (contentType && !ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json(
        { success: false, message: "Only jpeg, png, and webp images are allowed" },
        { status: 400 }
      );
    }

    const makesPrimary = Boolean(isPrimary);

    if (makesPrimary) {
      await prisma.productImage.updateMany({
        where: { productId: id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const nextSortOrder = sortOrder != null
      ? Number(sortOrder)
      : await prisma.productImage.count({ where: { productId: id } });

    const image = await prisma.productImage.create({
      data: {
        productId: id,
        imageUrl,
        altText: altText ?? null,
        isPrimary: makesPrimary,
        sortOrder: nextSortOrder,
      },
      select: { id: true, imageUrl: true, altText: true, isPrimary: true, sortOrder: true },
    });

    return NextResponse.json({ success: true, data: image }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}
