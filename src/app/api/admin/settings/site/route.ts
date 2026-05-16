import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/admin-session";
import {
  readSiteSettings,
  writeSiteSettings,
  SITE_SETTINGS_MAX_BYTES,
} from "@/lib/services/site-settings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function statusFor(message: string): number {
  if (message === "Unauthorized") return 401;
  if (message.startsWith("Forbidden")) return 403;
  if (message.includes("too large")) return 413;
  return 500;
}

export async function GET() {
  try {
    await requireSuperAdmin();
    const data = await readSiteSettings();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, message }, { status: statusFor(message) });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireSuperAdmin();

    const contentLength = Number(req.headers.get("content-length") ?? "0");
    if (contentLength > SITE_SETTINGS_MAX_BYTES) {
      return NextResponse.json({ success: false, message: "Payload too large" }, { status: 413 });
    }

    const body = await req.json();
    const data = await writeSiteSettings(body);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, message }, { status: statusFor(message) });
  }
}
