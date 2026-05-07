import { NextRequest, NextResponse } from "next/server";
import { verifyOtp, createCustomerSession } from "@/lib/auth/customer-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();
    if (!email?.trim() || !code?.trim()) {
      return NextResponse.json({ success: false, message: "email and code are required" }, { status: 400 });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const valid = await verifyOtp(normalizedEmail, String(code).trim());
    if (!valid) {
      return NextResponse.json({ success: false, message: "Invalid or expired code" }, { status: 401 });
    }
    await createCustomerSession(normalizedEmail);
    return NextResponse.json({ success: true, email: normalizedEmail });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
