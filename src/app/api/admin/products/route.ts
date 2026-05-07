import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedAdmin } from "@/lib/auth/admin-session";
import { toSlug } from "@/lib/utils/slug";
import { ProductType } from "@prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PRODUCT_TYPES = Object.values(ProductType);

export async function GET(req: NextRequest) {
  try {
    await requireAuthenticatedAdmin();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")));
    const categoryId = searchParams.get("categoryId") ?? undefined;
    const isActive = searchParams.get("isActive");
    const brand = searchParams.get("brand") ?? undefined;

    const where = {
      ...(categoryId ? { categoryId } : {}),
      ...(isActive !== null ? { isActive: isActive === "true" } : {}),
      ...(brand ? { brand } : {}),
    };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          categoryId: true,
          name: true,
          slug: true,
          shortDescription: true,
          sku: true,
          price: true,
          compareAtPrice: true,
          stockQty: true,
          lowStockThreshold: true,
          productType: true,
          isActive: true,
          isFeatured: true,
          brand: true,
          createdAt: true,
          updatedAt: true,
          category: { select: { id: true, name: true, slug: true } },
          images: {
            where: { isPrimary: true },
            select: { id: true, imageUrl: true, altText: true },
            take: 1,
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuthenticatedAdmin();

    const body = await req.json();
    const {
      categoryId,
      name,
      shortDescription,
      description,
      sku,
      price,
      compareAtPrice,
      stockQty = 0,
      lowStockThreshold = 3,
      productType = "physical",
      isActive = true,
      isFeatured = false,
      brand = "3dprintzone",
    } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ success: false, message: "name is required" }, { status: 400 });
    }
    if (!categoryId || typeof categoryId !== "string") {
      return NextResponse.json({ success: false, message: "categoryId is required" }, { status: 400 });
    }
    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      return NextResponse.json({ success: false, message: "price must be a non-negative number" }, { status: 400 });
    }
    if (!PRODUCT_TYPES.includes(productType)) {
      return NextResponse.json(
        { success: false, message: `productType must be one of: ${PRODUCT_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
    }

    const slug = toSlug(name);
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      return NextResponse.json(
        { success: false, message: "A product with this name already exists" },
        { status: 409 }
      );
    }

    if (sku) {
      const existingSku = await prisma.product.findUnique({ where: { sku } });
      if (existingSku) {
        return NextResponse.json({ success: false, message: "SKU already in use" }, { status: 409 });
      }
    }

    const product = await prisma.product.create({
      data: {
        categoryId,
        name: name.trim(),
        slug,
        shortDescription: shortDescription ?? null,
        description: description ?? null,
        sku: sku ?? null,
        price: Number(price),
        compareAtPrice: compareAtPrice != null ? Number(compareAtPrice) : null,
        stockQty: Number(stockQty),
        lowStockThreshold: Number(lowStockThreshold),
        productType,
        isActive: Boolean(isActive),
        isFeatured: Boolean(isFeatured),
        brand,
      },
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
