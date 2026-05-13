import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const brand = req.nextUrl.searchParams.get("brand") ?? "3dprintzone";
    const categories = await prisma.category.findMany({
      where: { isActive: true, brand },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id:          true,
        name:        true,
        slug:        true,
        description: true,
        iconKey:     true,
        imageUrl:    true,
        sortOrder:   true,
        _count:      { select: { products: { where: { isActive: true, brand } } } },
      },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
