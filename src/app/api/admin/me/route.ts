import { NextResponse } from "next/server";
import { requireAuthenticatedAdmin } from "@/lib/auth/admin-session";

export async function GET() {
  try {
    const admin = await requireAuthenticatedAdmin();

    return NextResponse.json({
      success: true,
      admin,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";

    return NextResponse.json(
      { success: false, message },
      { status: 401 }
    );
  }
}