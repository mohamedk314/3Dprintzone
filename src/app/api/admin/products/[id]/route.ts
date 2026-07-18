import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedAdmin } from "@/lib/auth/admin-session";
import { toSlug } from "@/lib/utils/slug";
import { ProductType } from "@prisma/client";
import { deleteR2Objects } from "@/lib/services/r2";
import { PRODUCT_SEO_LIMITS, normalizeSeoField } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PRODUCT_TYPES = Object.values(ProductType);

const productSelect = {
  id: true,
  categoryId: true,
  name: true,
  slug: true,
  shortDescription: true,
  description: true,
  sku: true,
  seoTitle: true,
  seoDescription: true,
  seoKeywords: true,
  price: true,
  compareAtPrice: true,
  stockQty: true,
  lowStockThreshold: true,
  productType: true,
  isActive: true,
  isFeatured: true,
  forceShippingDiscussion: true,
  brand: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true, slug: true } },
  images: {
    select: { id: true, imageUrl: true, altText: true, isPrimary: true, sortOrder: true },
    orderBy: { sortOrder: "asc" as const },
  },
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuthenticatedAdmin();

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      select: productSelect,
    });

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuthenticatedAdmin();

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim() === "") {
        return NextResponse.json({ success: false, message: "name must be a non-empty string" }, { status: 400 });
      }
      const slug = toSlug(body.name);
      if (slug !== existing.slug) {
        const conflict = await prisma.product.findUnique({ where: { slug } });
        if (conflict) {
          return NextResponse.json(
            { success: false, message: "A product with this name already exists" },
            { status: 409 }
          );
        }
        updateData.slug = slug;
      }
      updateData.name = body.name.trim();
    }

    if (body.categoryId !== undefined) {
      const category = await prisma.category.findUnique({ where: { id: body.categoryId } });
      if (!category) {
        return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
      }
      updateData.categoryId = body.categoryId;
    }

    if (body.price !== undefined) {
      if (isNaN(Number(body.price)) || Number(body.price) < 0) {
        return NextResponse.json({ success: false, message: "price must be a non-negative number" }, { status: 400 });
      }
      updateData.price = Number(body.price);
    }

    if (body.productType !== undefined) {
      if (!PRODUCT_TYPES.includes(body.productType)) {
        return NextResponse.json(
          { success: false, message: `productType must be one of: ${PRODUCT_TYPES.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.productType = body.productType;
    }

    if (body.sku !== undefined) {
      if (body.sku !== null) {
        const conflict = await prisma.product.findFirst({
          where: { sku: body.sku, id: { not: id } },
        });
        if (conflict) {
          return NextResponse.json({ success: false, message: "SKU already in use" }, { status: 409 });
        }
      }
      updateData.sku = body.sku ?? null;
    }

    const seoLimits = {
      seoTitle: PRODUCT_SEO_LIMITS.title,
      seoDescription: PRODUCT_SEO_LIMITS.description,
      seoKeywords: PRODUCT_SEO_LIMITS.keywords,
    } as const;
    for (const [field, max] of Object.entries(seoLimits)) {
      if (body[field] !== undefined) {
        const result = normalizeSeoField(body[field], max);
        if (result && typeof result === "object") {
          return NextResponse.json({ success: false, message: `${field} ${result.error}` }, { status: 400 });
        }
        updateData[field] = result;
      }
    }

    if (body.shortDescription !== undefined) updateData.shortDescription = body.shortDescription ?? null;
    if (body.description !== undefined) updateData.description = body.description ?? null;
    if (body.compareAtPrice !== undefined) updateData.compareAtPrice = body.compareAtPrice != null ? Number(body.compareAtPrice) : null;
    if (body.stockQty !== undefined) {
      const newQty = Number(body.stockQty);
      updateData.stockQty = newQty;
      // Reset alert flags when stock is replenished
      if (newQty > 0) updateData.outOfStockAlertSentAt = null;
      if (newQty > (body.lowStockThreshold !== undefined ? Number(body.lowStockThreshold) : existing.lowStockThreshold)) {
        updateData.lowStockAlertSentAt = null;
      }
    }
    if (body.lowStockThreshold !== undefined) updateData.lowStockThreshold = Number(body.lowStockThreshold);
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
    if (body.isFeatured !== undefined) updateData.isFeatured = Boolean(body.isFeatured);
    if (body.forceShippingDiscussion !== undefined) updateData.forceShippingDiscussion = Boolean(body.forceShippingDiscussion);
    if (body.brand !== undefined) updateData.brand = body.brand;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      select: productSelect,
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuthenticatedAdmin();

    const { id } = await params;

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { images: { select: { imageUrl: true } } },
    });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    await deleteR2Objects(existing.images.map((img) => img.imageUrl));

    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, message: "Product deactivated" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
