import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getOrCreateSessionId } from "@/lib/utils/session";
import { generateOrderRef } from "@/lib/utils/order-ref";
import { PaymentMethod } from "@prisma/client";
import { getShippingConfig } from "@/lib/services/shipping";
import { sendOrderConfirmationEmail, sendNewOrderAdminEmail } from "@/lib/email/notifications";
import { getCustomerSession } from "@/lib/auth/customer-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_PAYMENT_METHODS = Object.values(PaymentMethod);

export async function POST(req: NextRequest) {
  try {
    const customerSession = await getCustomerSession();
    if (!customerSession) {
      return NextResponse.json(
        { success: false, message: "Authentication required. Please verify your email first." },
        { status: 401 }
      );
    }

    const sessionId = await getOrCreateSessionId();
    const body      = await req.json();

    const {
      customerName,
      phone,
      paymentMethod,
      notes,
      address: addr,
      brand = "3dprintzone",
      shippingZoneId,
      shippingMethodId,
    } = body;

    const email = customerSession.email;

    // --- required field validation ---
    if (!customerName?.trim()) {
      return NextResponse.json({ success: false, message: "customerName is required" }, { status: 400 });
    }
    if (!phone?.trim()) {
      return NextResponse.json({ success: false, message: "phone is required" }, { status: 400 });
    }
    if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, message: `paymentMethod must be one of: ${VALID_PAYMENT_METHODS.join(", ")}` },
        { status: 400 }
      );
    }
    if (!addr?.governorate?.trim() || !addr?.city?.trim() || !addr?.addressLine1?.trim()) {
      return NextResponse.json(
        { success: false, message: "address.governorate, address.city, and address.addressLine1 are required" },
        { status: 400 }
      );
    }

    // --- cart validation ---
    const cart = await prisma.cart.findUnique({
      where:  { sessionId_brand: { sessionId, brand } },
      select: {
        id:    true,
        items: {
          select: {
            id:        true,
            qty:       true,
            unitPrice: true,
            product: {
              select: {
                id:                      true,
                name:                    true,
                sku:                     true,
                price:                   true,
                stockQty:                true,
                productType:             true,
                isActive:                true,
                forceShippingDiscussion: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ success: false, message: "Cart is empty" }, { status: 422 });
    }

    for (const item of cart.items) {
      if (!item.product.isActive) {
        return NextResponse.json(
          { success: false, message: `Product "${item.product.name}" is no longer available` },
          { status: 422 }
        );
      }
      if (item.product.productType === "physical" && item.product.stockQty < item.qty) {
        return NextResponse.json(
          {
            success: false,
            message: `"${item.product.name}" only has ${item.product.stockQty} units in stock`,
          },
          { status: 422 }
        );
      }
    }

    const hasForceDiscussion = cart.items.some((i) => i.product.forceShippingDiscussion);

    let shippingFeeAmount = 0;
    let resolvedZoneId: string | null = null;
    let resolvedMethodId: string | null = null;

    if (hasForceDiscussion) {
      // One or more products require manual shipping — fee stays 0, no zone/method applied
    } else if (shippingZoneId || shippingMethodId) {
      if (shippingZoneId) {
        const zone = await prisma.shippingZone.findUnique({
          where: { id: shippingZoneId, isActive: true },
          select: { id: true, priceOverride: true },
        });
        if (zone) {
          shippingFeeAmount += Number(zone.priceOverride);
          resolvedZoneId = zone.id;
        }
      }
      if (shippingMethodId) {
        const method = await prisma.shippingMethod.findUnique({
          where: { id: shippingMethodId, isActive: true },
          select: { id: true, price: true },
        });
        if (method) {
          shippingFeeAmount += Number(method.price);
          resolvedMethodId = method.id;
        }
      }
    } else {
      const shippingConfig = await getShippingConfig();
      shippingFeeAmount = shippingConfig.type === "fixed" ? shippingConfig.amount : 0;
    }


    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.qty,
      0
    );
    const total = subtotal + shippingFeeAmount;

    // --- create order (transaction) ---
    const orderRef = generateOrderRef(brand);

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderRef,
          customerName: customerName.trim(),
          email:        email.trim().toLowerCase(),
          phone:        phone.trim(),
          status:       "ordered_cod",
          paymentMethod,
          subtotal,
          shippingFee: shippingFeeAmount,
          total,
          notes: [
            notes?.trim() || null,
            hasForceDiscussion ? "[Shipping to be discussed – large/heavy item]" : null,
          ].filter(Boolean).join(" ") || null,
          brand,
          shipmentStatus: "pending",
          ...(resolvedZoneId   ? { shippingZoneId:   resolvedZoneId }   : {}),
          ...(resolvedMethodId ? { shippingMethodId: resolvedMethodId } : {}),
          address: {
            create: {
              governorate:  addr.governorate.trim(),
              city:         addr.city.trim(),
              area:         addr.area?.trim()         || null,
              addressLine1: addr.addressLine1.trim(),
              addressLine2: addr.addressLine2?.trim() || null,
              building:     addr.building?.trim()     || null,
              floor:        addr.floor?.trim()        || null,
              apartment:    addr.apartment?.trim()    || null,
              landmark:     addr.landmark?.trim()     || null,
            },
          },
          items: {
            create: cart.items.map((item) => ({
              productId:   item.product.id,
              productName: item.product.name,
              sku:         item.product.sku ?? null,
              qty:         item.qty,
              unitPrice:   Number(item.unitPrice),
              lineTotal:   Number(item.unitPrice) * item.qty,
            })),
          },
        },
        select: {
          id:            true,
          orderRef:      true,
          status:        true,
          paymentMethod: true,
          subtotal:      true,
          shippingFee:   true,
          total:         true,
          createdAt:     true,
        },
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    const fullOrderForEmail = await prisma.order.findUnique({
      where: { id: order.id },
      select: {
        orderRef:      true,
        customerName:  true,
        email:         true,
        total:         true,
        paymentMethod: true,
        brand:         true,
        phone:         true,
        items: { select: { productName: true, qty: true, lineTotal: true } },
      },
    });
    if (fullOrderForEmail) {
      const emailPayload = {
        ...fullOrderForEmail,
        total:         Number(fullOrderForEmail.total),
        paymentMethod: String(fullOrderForEmail.paymentMethod),
        items:         fullOrderForEmail.items.map((i) => ({ ...i, lineTotal: Number(i.lineTotal) })),
      };
      Promise.all([
        sendOrderConfirmationEmail(emailPayload).catch((e) => console.error("[email]", e)),
        sendNewOrderAdminEmail(emailPayload).catch((e) => console.error("[email]", e)),
      ]);
    }

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
