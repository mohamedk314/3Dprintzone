import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const brand = req.nextUrl.searchParams.get("brand") ?? "3dprintzone";
    const zones = await prisma.shippingZone.findMany({
      where: {
        isActive: true,
        OR: [{ brand: "both" }, { brand }],
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        governorates: true,
        priceOverride: true,
        estimatedDaysMin: true,
        estimatedDaysMax: true,
      },
    });
    return NextResponse.json({ success: true, data: zones });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
