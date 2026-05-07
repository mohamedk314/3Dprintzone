import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthenticatedAdmin } from "@/lib/auth/admin-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? undefined;
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = 20;

    const where = status ? { status: status as "pending" | "approved" | "rejected" } : {};

    const [total, reviews] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, name: true, email: true, rating: true, body: true, status: true, createdAt: true,
          product: { select: { id: true, name: true, slug: true } },
        },
      }),
    ]);

    return NextResponse.json({ success: true, data: reviews, meta: { total, page, pages: Math.ceil(total / limit) } });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
