import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedAdmin } from "@/lib/auth/admin-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuthenticatedAdmin();
    const { id } = await params;
    const body = await req.json();
    const { name, governorates, priceOverride, estimatedDaysMin, estimatedDaysMax, isActive, brand } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name.trim();
    if (governorates !== undefined) data.governorates = governorates.trim();
    if (priceOverride !== undefined) data.priceOverride = Number(priceOverride);
    if (estimatedDaysMin !== undefined) data.estimatedDaysMin = Number(estimatedDaysMin);
    if (estimatedDaysMax !== undefined) data.estimatedDaysMax = Number(estimatedDaysMax);
    if (isActive !== undefined) data.isActive = isActive;
    if (brand !== undefined) data.brand = brand;

    const zone = await prisma.shippingZone.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: zone });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuthenticatedAdmin();
    const { id } = await params;
    await prisma.shippingZone.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}
