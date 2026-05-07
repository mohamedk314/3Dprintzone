import { NextRequest, NextResponse } from "next/server";
import { createOtp } from "@/lib/auth/customer-session";
import { sendCustomerOtpEmail } from "@/lib/email/notifications";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ success: false, message: "Valid email is required" }, { status: 400 });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const code = await createOtp(normalizedEmail);
    await sendCustomerOtpEmail(normalizedEmail, code).catch((err) => console.error("[OTP email]", err));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
