import { NextResponse } from "next/server";
import { clearCustomerSession } from "@/lib/auth/customer-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  await clearCustomerSession();
  return NextResponse.json({ success: true });
}
