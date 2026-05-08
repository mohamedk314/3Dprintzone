import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedAdmin } from "@/lib/auth/admin-session";
import { OrderStatus, PaymentMethod } from "@prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_STATUSES = Object.values(OrderStatus);
const VALID_PAYMENT_METHODS = Object.values(PaymentMethod);

export async function GET(req: NextRequest) {
  try {
    await requireAuthenticatedAdmin();

    const { searchParams } = new URL(req.url);
    const page    = Math.max(1, Number(searchParams.get("page")  ?? "1"));
    const limit   = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")));
    const status  = searchParams.get("status") as OrderStatus | null;
    const payment = searchParams.get("paymentMethod") as PaymentMethod | null;
    const search  = searchParams.get("search")?.trim() ?? "";
    const from    = searchParams.get("from");
    const to      = searchParams.get("to");
    const brand   = searchParams.get("brand") ?? undefined;

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, message: `status must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    if (payment && !VALID_PAYMENT_METHODS.includes(payment)) {
      return NextResponse.json(
        { success: false, message: `paymentMethod must be one of: ${VALID_PAYMENT_METHODS.join(", ")}` },
        { status: 400 }
      );
    }

    const where = {
      ...(status  ? { status }                        : {}),
      ...(payment ? { paymentMethod: payment }        : {}),
      ...(brand   ? { brand }                         : {}),
      ...(from || to ? {
        createdAt: {
          ...(from ? { gte: new Date(from) } : {}),
          ...(to   ? { lte: new Date(to)   } : {}),
        },
      } : {}),
      ...(search ? {
        OR: [
          { orderRef:      { contains: search } },
          { customerName:  { contains: search } },
          { email:         { contains: search } },
          { phone:         { contains: search } },
        ],
      } : {}),
    };

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id:             true,
          orderRef:       true,
          customerName:   true,
          email:          true,
          phone:          true,
          status:         true,
          shipmentStatus: true,
          paymentMethod:  true,
          subtotal:       true,
          shippingFee:    true,
          total:          true,
          brand:          true,
          createdAt:      true,
          updatedAt:      true,
          _count:         { select: { items: true } },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    const status  = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
