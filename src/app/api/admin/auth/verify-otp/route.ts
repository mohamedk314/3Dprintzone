import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyAdminOtp } from "@/lib/services/admin/auth.service";
import { env } from "@/lib/utils/env";

const schema = z.object({
  email: z.string().email(),
  otp: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // accept both `otp` and legacy `code` field names
    const normalized = { email: body.email, otp: body.otp ?? body.code };
    const data = schema.parse(normalized);

    const result = await verifyAdminOtp(data.email, data.otp);

    const cookieStore = await cookies();
    cookieStore.set("admin_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: env.ADMIN_SESSION_EXPIRES_DAYS * 24 * 60 * 60,
    });

    return NextResponse.json({ success: true, admin: result.admin });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to verify OTP";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
