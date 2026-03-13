import { NextResponse } from "next/server";
import { z } from "zod";
import { requestAdminOtp } from "@/lib/services/admin/auth.service";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const result = await requestAdminOtp(data.email);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to request OTP";

    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}