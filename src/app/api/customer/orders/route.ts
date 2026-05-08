import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCustomerSession } from "@/lib/auth/customer-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where:   { email: session.email },
    orderBy: { createdAt: "desc" },
    select: {
      id:                true,
      orderRef:          true,
      status:            true,
      paymentMethod:     true,
      subtotal:          true,
      shippingFee:       true,
      total:             true,
      brand:             true,
      shipmentStatus:    true,
      trackingNumber:    true,
      courierName:       true,
      estimatedDelivery: true,
      createdAt:         true,
      items: {
        select: { productName: true, qty: true, unitPrice: true, lineTotal: true },
      },
      address: {
        select: { governorate: true, city: true, addressLine1: true },
      },
      shippingMethod: {
        select: { name: true },
      },
      shippingZone: {
        select: { name: true },
      },
    },
  });

  return NextResponse.json({ success: true, data: orders });
}
