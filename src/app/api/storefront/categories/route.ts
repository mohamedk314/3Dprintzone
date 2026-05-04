import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id:          true,
        name:        true,
        slug:        true,
        description: true,
        sortOrder:   true,
        _count:      { select: { products: { where: { isActive: true } } } },
      },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
