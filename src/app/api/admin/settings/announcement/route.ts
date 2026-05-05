import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedAdmin } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(req: NextRequest) {
  try {
    await requireAuthenticatedAdmin();
    const body = await req.json();

    const text = typeof body.text === "string" ? body.text.trim() : null;
    if (!text) {
      return NextResponse.json({ success: false, message: "text is required" }, { status: 400 });
    }
    if (text.length > 120) {
      return NextResponse.json({ success: false, message: "text must be 120 characters or fewer" }, { status: 400 });
    }

    await prisma.siteSetting.upsert({
      where: { key: "announcement_text" },
      create: { key: "announcement_text", value: text },
      update: { value: text },
    });

    return NextResponse.json({ success: true, data: { text } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}
