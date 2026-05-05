import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedAdmin } from "@/lib/auth/admin-session";
import { getShippingConfig, setShippingConfig } from "@/lib/services/shipping";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAuthenticatedAdmin();
    const config = await getShippingConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAuthenticatedAdmin();
    const body = await req.json();

    const type = body.type;
    if (type !== "fixed" && type !== "discussed") {
      return NextResponse.json({ success: false, message: "type must be 'fixed' or 'discussed'" }, { status: 400 });
    }

    const amount = type === "fixed" ? Number(body.amount ?? 0) : 0;
    if (type === "fixed" && (isNaN(amount) || amount < 0)) {
      return NextResponse.json({ success: false, message: "amount must be a non-negative number" }, { status: 400 });
    }

    await setShippingConfig({ type, amount });
    return NextResponse.json({ success: true, data: { type, amount } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}
