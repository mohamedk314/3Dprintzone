import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthenticatedAdmin } from "@/lib/auth/admin-session";
import { deleteAdminSessionById } from "@/lib/services/admin/auth.service";

export async function POST() {
  const admin = await getAuthenticatedAdmin();

  if (admin) {
    await deleteAdminSessionById(admin.sessionId);
  }

  const cookieStore = await cookies();

  cookieStore.set("admin_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json({ success: true });
}