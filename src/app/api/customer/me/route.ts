import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth/customer-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  return NextResponse.json({ success: true, data: { email: session.email } });
}
