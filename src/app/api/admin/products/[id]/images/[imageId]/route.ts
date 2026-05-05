import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedAdmin } from "@/lib/auth/admin-session";
import { deleteR2Object } from "@/lib/services/r2";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    await requireAuthenticatedAdmin();
    const { id, imageId } = await params;

    const image = await prisma.productImage.findFirst({ where: { id: imageId, productId: id } });
    if (!image) {
      return NextResponse.json({ success: false, message: "Image not found" }, { status: 404 });
    }

    const body = await req.json();

    if (body.isPrimary === true) {
      await prisma.$transaction([
        prisma.productImage.updateMany({ where: { productId: id, isPrimary: true }, data: { isPrimary: false } }),
        prisma.productImage.update({ where: { id: imageId }, data: { isPrimary: true } }),
      ]);
    }

    if (typeof body.altText === "string") {
      await prisma.productImage.update({ where: { id: imageId }, data: { altText: body.altText } });
    }

    const updated = await prisma.productImage.findUnique({
      where: { id: imageId },
      select: { id: true, imageUrl: true, altText: true, isPrimary: true, sortOrder: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    await requireAuthenticatedAdmin();
    const { id, imageId } = await params;

    const image = await prisma.productImage.findFirst({ where: { id: imageId, productId: id } });
    if (!image) {
      return NextResponse.json({ success: false, message: "Image not found" }, { status: 404 });
    }

    await deleteR2Object(image.imageUrl);
    await prisma.productImage.delete({ where: { id: imageId } });

    // If deleted image was primary, promote the first remaining image
    if (image.isPrimary) {
      const next = await prisma.productImage.findFirst({
        where: { productId: id },
        orderBy: { sortOrder: "asc" },
      });
      if (next) {
        await prisma.productImage.update({ where: { id: next.id }, data: { isPrimary: true } });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}
