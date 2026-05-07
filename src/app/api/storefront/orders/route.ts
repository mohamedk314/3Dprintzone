import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getOrCreateSessionId } from "@/lib/utils/session";
import { generateOrderRef } from "@/lib/utils/order-ref";
import { PaymentMethod } from "@prisma/client";
import { getShippingConfig } from "@/lib/services/shipping";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_PAYMENT_METHODS = Object.values(PaymentMethod);

export async function POST(req: NextRequest) {
  try {
    const sessionId = await getOrCreateSessionId();
    const body      = await req.json();

    const {
      customerName,
      email,
      phone,
      paymentMethod,
      notes,
      address: addr,
      brand = "3dprintzone",
    } = body;

    // --- required field validation ---
    if (!customerName?.trim()) {
      return NextResponse.json({ success: false, message: "customerName is required" }, { status: 400 });
    }
    if (!email?.trim()) {
      return NextResponse.json({ success: false, message: "email is required" }, { status: 400 });
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
                id:          true,
                name:        true,
                sku:         true,
                price:       true,
                stockQty:    true,
                productType: true,
                isActive:    true,
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

    const shippingConfig = await getShippingConfig();
    const shippingFeeAmount = shippingConfig.type === "fixed" ? shippingConfig.amount : 0;

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
          status:       "ordered_cod", // paymob webhook updates to ordered_paid on success
          paymentMethod,
          subtotal,
          shippingFee: shippingFeeAmount,
          total,
          notes:       notes?.trim() || null,
          brand,
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

      // decrement stock for physical products
      for (const item of cart.items) {
        if (item.product.productType === "physical") {
          await tx.product.update({
            where: { id: item.product.id },
            data:  { stockQty: { decrement: item.qty } },
          });
        }
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
