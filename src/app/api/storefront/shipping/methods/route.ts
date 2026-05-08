import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const brand = req.nextUrl.searchParams.get("brand") ?? "3dprintzone";
    const methods = await prisma.shippingMethod.findMany({
      where: {
        isActive: true,
        OR: [{ brand: "both" }, { brand }],
      },
      orderBy: { price: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        estimatedDays: true,
      },
    });
    return NextResponse.json({ success: true, data: methods });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
