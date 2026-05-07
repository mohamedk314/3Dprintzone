import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCustomerSession } from "@/lib/auth/customer-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    if (!productId) return NextResponse.json({ success: false, message: "productId required" }, { status: 400 });

    const reviews = await prisma.review.findMany({
      where: { productId, status: "approved" },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, rating: true, body: true, createdAt: true },
    });

    const total = reviews.length;
    const avg = total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;

    return NextResponse.json({ success: true, data: reviews, meta: { total, avg: Math.round(avg * 10) / 10 } });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCustomerSession();
    const body = await req.json();
    const { productId, rating, name, body: reviewBody } = body;

    if (!productId || !rating || !name) {
      return NextResponse.json({ success: false, message: "productId, rating, and name are required" }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, message: "Rating must be 1–5" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!product) return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });

    const email = session?.email ?? "guest@anonymous.com";

    const review = await prisma.review.create({
      data: {
        productId,
        email,
        name: String(name).slice(0, 100),
        rating: Number(rating),
        body: reviewBody ? String(reviewBody).slice(0, 2000) : null,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
