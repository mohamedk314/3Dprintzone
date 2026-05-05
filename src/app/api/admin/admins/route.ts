import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSuperAdmin();

    const admins = await prisma.adminUser.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: admins });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    const status = message.startsWith("Forbidden") ? 403 : 401;
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireSuperAdmin();

    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, message: "Valid email required" }, { status: 400 });
    }

    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, message: "Admin with this email already exists" }, { status: 409 });
    }

    const admin = await prisma.adminUser.create({
      data: { email, role: "admin", isActive: true },
      select: { id: true, email: true, role: true, isActive: true, createdAt: true },
    });

    return NextResponse.json({ success: true, data: admin }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    const status = message.startsWith("Forbidden") ? 403 : 401;
    return NextResponse.json({ success: false, message }, { status });
  }
}
