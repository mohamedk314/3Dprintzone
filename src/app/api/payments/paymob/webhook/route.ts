import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getPaymobConfig, verifyWebhookHmac } from "@/lib/services/paymob/client";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const config = getPaymobConfig();

  if (!config) {
    return NextResponse.json({ success: false }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const receivedHmac = searchParams.get("hmac") ?? "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: { type?: string; obj?: Record<string, any> } = await req.json();

    // Only handle transaction notifications
    if (body.type !== "TRANSACTION" || !body.obj) {
      return NextResponse.json({ success: true });
    }

    const txn = body.obj;

    // Verify HMAC integrity
    if (!verifyWebhookHmac(txn, receivedHmac, config.hmacSecret)) {
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 401 });
    }

    const merchantOrderId: string = txn?.order?.merchant_order_id ?? "";

    if (!merchantOrderId) {
      return NextResponse.json({ success: true }); // not our order
    }

    const order = await prisma.order.findUnique({
      where:  { orderRef: merchantOrderId },
      select: { id: true, status: true, paymentMethod: true },
    });

    if (!order || order.paymentMethod !== "paymob") {
      return NextResponse.json({ success: true });
    }

    // Skip if order is already in a terminal state
    if (order.status === "ordered_paid" || order.status === "canceled") {
      return NextResponse.json({ success: true });
    }

    const succeeded: boolean = txn.success === true;
    const pending:   boolean = txn.pending === true;

    if (succeeded && !pending) {
      await prisma.order.update({
        where: { id: order.id },
        data:  { status: "ordered_paid" },
      });
    } else if (!succeeded && !pending) {
      await prisma.order.update({
        where: { id: order.id },
        data:  { status: "canceled" },
      });
    }
    // if pending=true, payment is still processing — leave status unchanged

    return NextResponse.json({ success: true });
  } catch {
    // Always return 200 to Paymob to prevent retries for server errors
    return NextResponse.json({ success: true });
  }
}
