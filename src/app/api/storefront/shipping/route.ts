import { NextResponse } from "next/server";
import { getShippingConfig } from "@/lib/services/shipping";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const config = await getShippingConfig();
    return NextResponse.json({ success: true, data: config });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
