import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_TEXT = "Free delivery on orders above 500 EGP";

export async function GET() {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: "announcement_text" } });
    const text = row?.value ?? DEFAULT_TEXT;
    return NextResponse.json({ success: true, data: { text } });
  } catch {
    return NextResponse.json({ success: true, data: { text: DEFAULT_TEXT } });
  }
}
