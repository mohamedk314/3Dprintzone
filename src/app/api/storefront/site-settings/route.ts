import { NextResponse } from "next/server";
import { readSiteSettings, DEFAULT_SITE_SETTINGS } from "@/lib/services/site-settings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Public, read-only endpoint for the 3Dprintzone storefront.
 * Returns only business-facing content (contact details, homepage copy/images).
 * No secrets, no admin-only data.
 */
export async function GET() {
  try {
    const data = await readSiteSettings();
    return NextResponse.json({ success: true, data });
  } catch {
    // Fall back to defaults so the public storefront never breaks on read.
    return NextResponse.json({ success: true, data: DEFAULT_SITE_SETTINGS });
  }
}
