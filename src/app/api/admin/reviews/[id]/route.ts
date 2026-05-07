import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthenticatedAdmin } from "@/lib/auth/admin-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
    }

    const review = await prisma.review.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, data: review });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await prisma.review.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
