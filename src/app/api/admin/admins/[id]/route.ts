import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const me = await requireSuperAdmin();
    const { id } = await params;

    const target = await prisma.adminUser.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ success: false, message: "Admin not found" }, { status: 404 });
    }
    if (target.role === "super_admin") {
      return NextResponse.json({ success: false, message: "Cannot modify a super admin" }, { status: 403 });
    }
    if (target.id === me.adminUserId) {
      return NextResponse.json({ success: false, message: "Cannot modify your own account" }, { status: 403 });
    }

    const body = await req.json();
    const data: { isActive?: boolean } = {};
    if (typeof body.isActive === "boolean") data.isActive = body.isActive;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, message: "No valid fields to update" }, { status: 400 });
    }

    const updated = await prisma.adminUser.update({
      where: { id },
      data,
      select: { id: true, email: true, role: true, isActive: true, createdAt: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    const status = message.startsWith("Forbidden") ? 403 : 401;
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const me = await requireSuperAdmin();
    const { id } = await params;

    const target = await prisma.adminUser.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ success: false, message: "Admin not found" }, { status: 404 });
    }
    if (target.role === "super_admin") {
      return NextResponse.json({ success: false, message: "Cannot delete a super admin" }, { status: 403 });
    }
    if (target.id === me.adminUserId) {
      return NextResponse.json({ success: false, message: "Cannot delete your own account" }, { status: 403 });
    }

    await prisma.adminUser.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    const status = message.startsWith("Forbidden") ? 403 : 401;
    return NextResponse.json({ success: false, message }, { status });
  }
}
