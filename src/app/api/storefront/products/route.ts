import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ProductType } from "@prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page        = Math.max(1, Number(searchParams.get("page")  ?? "1"));
    const limit       = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")));
    const categorySlug = searchParams.get("category") ?? undefined;
    const search      = searchParams.get("search")?.trim() ?? "";
    const featured    = searchParams.get("featured");
    const type        = searchParams.get("type") as ProductType | null;
    const minPrice    = searchParams.get("minPrice");
    const maxPrice    = searchParams.get("maxPrice");
    const sort        = searchParams.get("sort") ?? "newest";
    const brand       = searchParams.get("brand") ?? "3dprintzone";

    const orderBy = (() => {
      switch (sort) {
        case "price_asc":  return { price: "asc"  as const };
        case "price_desc": return { price: "desc" as const };
        case "name_asc":   return { name:  "asc"  as const };
        default:           return { createdAt: "desc" as const };
      }
    })();

    const where = {
      isActive: true,
      brand,
      ...(featured === "true" ? { isFeatured: true } : {}),
      ...(type ? { productType: type } : {}),
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(minPrice || maxPrice ? {
        price: {
          ...(minPrice ? { gte: Number(minPrice) } : {}),
          ...(maxPrice ? { lte: Number(maxPrice) } : {}),
        },
      } : {}),
      ...(search ? {
        OR: [
          { name:             { contains: search } },
          { shortDescription: { contains: search } },
          { sku:              { contains: search } },
        ],
      } : {}),
    };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
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
          category:         { select: { name: true, slug: true } },
          images: {
            where:   { isPrimary: true },
            select:  { imageUrl: true, altText: true },
            take:    1,
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
