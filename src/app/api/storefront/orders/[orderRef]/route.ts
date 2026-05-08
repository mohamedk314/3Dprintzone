import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderRef: string }> }
) {
  try {
    const { orderRef } = await params;

    const order = await prisma.order.findUnique({
      where:  { orderRef },
      select: {
        id:                true,
        orderRef:          true,
        customerName:      true,
        status:            true,
        paymentMethod:     true,
        subtotal:          true,
        shippingFee:       true,
        total:             true,
        shipmentStatus:    true,
        trackingNumber:    true,
        courierName:       true,
        estimatedDelivery: true,
        createdAt:         true,
        updatedAt:         true,
        address: {
          select: {
            governorate:  true,
            city:         true,
            area:         true,
            addressLine1: true,
            addressLine2: true,
          },
        },
        items: {
          select: {
            productName: true,
            sku:         true,
            qty:         true,
            unitPrice:   true,
            lineTotal:   true,
          },
        },
        shippingMethod: {
          select: { name: true, estimatedDays: true },
        },
        shippingZone: {
          select: { name: true, estimatedDaysMin: true, estimatedDaysMax: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
