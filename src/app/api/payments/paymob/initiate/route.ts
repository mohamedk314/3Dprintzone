import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  getPaymobConfig,
  getAuthToken,
  registerOrder,
  getPaymentKey,
  buildCheckoutUrl,
} from "@/lib/services/paymob/client";

export const runtime = "nodejs";

const CURRENCY = "EGP";

export async function POST(req: NextRequest) {
  const config = getPaymobConfig();

  if (!config) {
    return NextResponse.json(
      { success: false, message: "Payment service is not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { orderRef } = body;

    if (!orderRef || typeof orderRef !== "string") {
      return NextResponse.json(
        { success: false, message: "orderRef is required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where:  { orderRef },
      select: {
        id:            true,
        orderRef:      true,
        customerName:  true,
        email:         true,
        phone:         true,
        paymentMethod: true,
        status:        true,
        total:         true,
        address: {
          select: {
            governorate:  true,
            city:         true,
            addressLine1: true,
            building:     true,
            floor:        true,
            apartment:    true,
          },
        },
        items: {
          select: {
            productName: true,
            qty:         true,
            unitPrice:   true,
            lineTotal:   true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    if (order.paymentMethod !== "paymob") {
      return NextResponse.json(
        { success: false, message: "Order is not a Paymob order" },
        { status: 422 }
      );
    }

    if (order.status === "ordered_paid") {
      return NextResponse.json(
        { success: false, message: "Order is already paid" },
        { status: 422 }
      );
    }

    if (order.status === "canceled") {
      return NextResponse.json(
        { success: false, message: "Order has been canceled" },
        { status: 422 }
      );
    }

    const amountCents = Math.round(Number(order.total) * 100);

    const nameParts = order.customerName.trim().split(" ");
    const firstName = nameParts[0] ?? "Customer";
    const lastName  = nameParts.slice(1).join(" ") || "N/A";

    const billing = {
      first_name:   firstName,
      last_name:    lastName,
      email:        order.email,
      phone_number: order.phone,
      apartment:    order.address?.apartment  ?? "N/A",
      floor:        order.address?.floor      ?? "N/A",
      street:       order.address?.addressLine1 ?? "N/A",
      building:     order.address?.building   ?? "N/A",
      city:         order.address?.city       ?? "N/A",
      country:      "EG",
      state:        order.address?.governorate ?? "N/A",
      postal_code:  "N/A",
    };

    const paymobItems = order.items.map((item) => ({
      name:          item.productName,
      amount_cents:  Math.round(Number(item.unitPrice) * 100),
      description:   item.productName,
      quantity:      item.qty,
    }));

    // Three-step Paymob auth flow
    const token         = await getAuthToken(config.apiKey);
    const paymobOrderId = await registerOrder(token, order.orderRef, amountCents, CURRENCY, paymobItems);
    const paymentKey    = await getPaymentKey(
      token,
      paymobOrderId,
      amountCents,
      CURRENCY,
      config.integrationId,
      billing
    );

    const checkoutUrl = buildCheckoutUrl(config.iframeId, paymentKey);

    return NextResponse.json({ success: true, checkoutUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
