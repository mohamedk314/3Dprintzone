import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedAdmin } from "@/lib/auth/admin-session";
import { OrderStatus, ShipmentStatus } from "@prisma/client";
import { sendOrderStatusUpdateEmail, sendShipmentUpdateEmail } from "@/lib/email/notifications";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_STATUSES = Object.values(OrderStatus);
const VALID_SHIPMENT_STATUSES = Object.values(ShipmentStatus);

const orderDetailSelect = {
  id:                true,
  orderRef:          true,
  customerName:      true,
  email:             true,
  phone:             true,
  status:            true,
  paymentMethod:     true,
  subtotal:          true,
  shippingFee:       true,
  total:             true,
  notes:             true,
  brand:             true,
  shipmentStatus:    true,
  trackingNumber:    true,
  courierName:       true,
  estimatedDelivery: true,
  shippingMethodId:  true,
  shippingZoneId:    true,
  createdAt:         true,
  updatedAt:         true,
  address: {
    select: {
      id:           true,
      governorate:  true,
      city:         true,
      area:         true,
      addressLine1: true,
      addressLine2: true,
      building:     true,
      floor:        true,
      apartment:    true,
      landmark:     true,
    },
  },
  items: {
    select: {
      id:          true,
      productId:   true,
      productName: true,
      sku:         true,
      qty:         true,
      unitPrice:   true,
      lineTotal:   true,
    },
  },
  shippingMethod: {
    select: { id: true, name: true, estimatedDays: true },
  },
  shippingZone: {
    select: { id: true, name: true, estimatedDaysMin: true, estimatedDaysMax: true },
  },
} as const;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuthenticatedAdmin();

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      select: orderDetailSelect,
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    const status  = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuthenticatedAdmin();

    const { id } = await params;
    const body = await req.json();
    const { status, notes, shippingFee, shipmentStatus, trackingNumber, courierName, estimatedDelivery } = body;

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    if (existing.status === "canceled") {
      return NextResponse.json(
        { success: false, message: "Cannot update a canceled order" },
        { status: 422 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { success: false, message: `status must be one of: ${VALID_STATUSES.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (notes !== undefined) {
      updateData.notes = notes ?? null;
    }

    if (shippingFee !== undefined) {
      const fee = Number(shippingFee);
      if (isNaN(fee) || fee < 0) {
        return NextResponse.json(
          { success: false, message: "shippingFee must be a non-negative number" },
          { status: 400 }
        );
      }
      const subtotal = Number(existing.subtotal);
      updateData.shippingFee = fee;
      updateData.total       = subtotal + fee;
    }

    if (shipmentStatus !== undefined) {
      if (shipmentStatus !== null && !VALID_SHIPMENT_STATUSES.includes(shipmentStatus)) {
        return NextResponse.json(
          { success: false, message: `shipmentStatus must be one of: ${VALID_SHIPMENT_STATUSES.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.shipmentStatus = shipmentStatus ?? null;
    }

    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber?.trim() || null;
    if (courierName !== undefined) updateData.courierName = courierName?.trim() || null;
    if (estimatedDelivery !== undefined) {
      updateData.estimatedDelivery = estimatedDelivery ? new Date(estimatedDelivery) : null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided" },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      select: orderDetailSelect,
    });

    if (updateData.status) {
      sendOrderStatusUpdateEmail({
        orderRef:     order.orderRef,
        customerName: order.customerName,
        email:        order.email,
        status:       order.status,
        total:        Number(order.total),
        brand:        order.brand,
      }).catch((e) => console.error("[email]", e));
    }

    if (updateData.shipmentStatus && ["shipped", "out_for_delivery", "delivered"].includes(updateData.shipmentStatus as string)) {
      sendShipmentUpdateEmail({
        orderRef:      order.orderRef,
        customerName:  order.customerName,
        email:         order.email,
        shipmentStatus: order.shipmentStatus as string,
        trackingNumber: order.trackingNumber ?? undefined,
        estimatedDelivery: order.estimatedDelivery ?? undefined,
        brand:         order.brand,
      }).catch((e) => console.error("[email]", e));
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    const status  = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
