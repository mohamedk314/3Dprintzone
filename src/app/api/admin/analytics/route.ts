import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedAdmin } from "@/lib/auth/admin-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await requireAuthenticatedAdmin();

    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to   = searchParams.get("to");

    const dateFilter = from || to ? {
      createdAt: {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to   ? { lte: new Date(to)   } : {}),
      },
    } : {};

    const orders = await prisma.order.findMany({
      where: dateFilter,
      select: {
        id:            true,
        total:         true,
        status:        true,
        paymentMethod: true,
        brand:         true,
        createdAt:     true,
      },
      orderBy: { createdAt: "asc" },
    });

    const nonCanceled = orders.filter((o) => o.status !== "canceled");
    const codOrders   = nonCanceled.filter((o) => o.status === "ordered_cod");

    const totalRevenue    = nonCanceled.reduce((s, o) => s + Number(o.total), 0);
    const codPendingAmt   = codOrders.reduce((s, o) => s + Number(o.total), 0);
    const paidCount       = nonCanceled.filter((o) => o.status === "ordered_paid" || o.status === "delivered").length;
    const codCount        = codOrders.length;
    const totalOrders     = orders.length;
    const avgOrderValue   = nonCanceled.length > 0 ? totalRevenue / nonCanceled.length : 0;

    // Daily time series
    const dailyMap = new Map<string, { revenue: number; orders: number }>();
    for (const o of nonCanceled) {
      const day = o.createdAt.toISOString().slice(0, 10);
      const e   = dailyMap.get(day) ?? { revenue: 0, orders: 0 };
      e.revenue += Number(o.total);
      e.orders  += 1;
      dailyMap.set(day, e);
    }
    const timeSeries = Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { revenue, orders }]) => ({ date, revenue, orders }));

    // Brand comparison
    const brandMap = new Map<string, { revenue: number; orders: number }>();
    for (const o of nonCanceled) {
      const e = brandMap.get(o.brand) ?? { revenue: 0, orders: 0 };
      e.revenue += Number(o.total);
      e.orders  += 1;
      brandMap.set(o.brand, e);
    }
    const brandComparison = Array.from(brandMap.entries())
      .map(([brand, data]) => ({ brand, ...data }));

    // Payment split
    const payMap = new Map<string, { count: number; revenue: number }>();
    for (const o of nonCanceled) {
      const e = payMap.get(o.paymentMethod) ?? { count: 0, revenue: 0 };
      e.count   += 1;
      e.revenue += Number(o.total);
      payMap.set(o.paymentMethod, e);
    }
    const paymentSplit = Array.from(payMap.entries())
      .map(([method, data]) => ({ method, ...data }));

    // Top 10 products by revenue
    const topProducts = await prisma.orderItem.groupBy({
      by:      ["productName"],
      where:   { order: { ...dateFilter, status: { not: "canceled" } } },
      _sum:    { qty: true, lineTotal: true },
      orderBy: { _sum: { lineTotal: "desc" } },
      take:    10,
    });

    return NextResponse.json({
      success: true,
      data: {
        kpis: { totalRevenue, codPendingAmt, paidCount, codCount, totalOrders, avgOrderValue },
        timeSeries,
        brandComparison,
        paymentSplit,
        topProducts: topProducts.map((p) => ({
          name:    p.productName,
          qty:     p._sum.qty     ?? 0,
          revenue: Number(p._sum.lineTotal ?? 0),
        })),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    const status  = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
