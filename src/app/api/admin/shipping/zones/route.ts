import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedAdmin } from "@/lib/auth/admin-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAuthenticatedAdmin();
    const zones = await prisma.shippingZone.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, data: zones });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuthenticatedAdmin();
    const body = await req.json();
    const { name, governorates, priceOverride, estimatedDaysMin, estimatedDaysMax, isActive, brand } = body;

    if (!name?.trim()) return NextResponse.json({ success: false, message: "name is required" }, { status: 400 });
    if (!governorates?.trim()) return NextResponse.json({ success: false, message: "governorates is required" }, { status: 400 });
    if (priceOverride === undefined || priceOverride === null) return NextResponse.json({ success: false, message: "priceOverride is required" }, { status: 400 });

    const zone = await prisma.shippingZone.create({
      data: {
        name: name.trim(),
        governorates: governorates.trim(),
        priceOverride: Number(priceOverride),
        estimatedDaysMin: Number(estimatedDaysMin ?? 1),
        estimatedDaysMax: Number(estimatedDaysMax ?? 3),
        isActive: isActive !== false,
        brand: brand ?? "both",
      },
    });
    return NextResponse.json({ success: true, data: zone }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}
