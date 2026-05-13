import { prisma } from "@/lib/db/prisma";
import { sendLowStockAlertEmail, sendOutOfStockAlertEmail } from "@/lib/email/notifications";
import { ProductType } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

type TxClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

interface StockItem {
  productId: string;
  qty: number;
}

export interface StockValidationResult {
  ok: boolean;
  error?: string;
}

/** Validates current stock levels without deducting. Call before deductStock. */
export async function validateStock(items: StockItem[]): Promise<StockValidationResult> {
  if (items.length === 0) return { ok: true };

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, productType: ProductType.physical },
    select: { id: true, name: true, stockQty: true },
  });

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue; // non-physical product — skip
    if (product.stockQty < item.qty) {
      return {
        ok: false,
        error: `"${product.name}" only has ${product.stockQty} unit${product.stockQty === 1 ? "" : "s"} in stock`,
      };
    }
  }
  return { ok: true };
}

/** Decrements stock for physical products. Must be called inside a transaction. */
export async function deductStock(items: StockItem[], tx: TxClient): Promise<void> {
  if (items.length === 0) return;

  const products = await tx.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, productType: ProductType.physical },
    select: { id: true },
  });
  const physicalIds = new Set(products.map((p) => p.id));

  for (const item of items) {
    if (physicalIds.has(item.productId)) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQty: { decrement: item.qty } },
      });
    }
  }
}

/** Increments stock for physical products (on cancel/return). Must be called inside a transaction. */
export async function returnStock(items: StockItem[], tx: TxClient): Promise<void> {
  if (items.length === 0) return;

  const products = await tx.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, productType: ProductType.physical },
    select: { id: true },
  });
  const physicalIds = new Set(products.map((p) => p.id));

  for (const item of items) {
    if (physicalIds.has(item.productId)) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQty: { increment: item.qty } },
      });
    }
  }
}

/** Fires low-stock / out-of-stock email alerts after a real stock deduction. Non-blocking. */
export function fireStockAlerts(productIds: string[]): void {
  if (productIds.length === 0) return;
  Promise.resolve()
    .then(async () => {
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true, name: true, sku: true, brand: true,
          stockQty: true, lowStockThreshold: true,
          lowStockAlertSentAt: true, outOfStockAlertSentAt: true,
        },
      });
      for (const p of products) {
        if (p.stockQty === 0 && !p.outOfStockAlertSentAt) {
          await prisma.product.update({ where: { id: p.id }, data: { outOfStockAlertSentAt: new Date() } });
          sendOutOfStockAlertEmail({ id: p.id, name: p.name, sku: p.sku, brand: p.brand }).catch(console.error);
        } else if (p.stockQty > 0 && p.stockQty <= p.lowStockThreshold && !p.lowStockAlertSentAt) {
          await prisma.product.update({ where: { id: p.id }, data: { lowStockAlertSentAt: new Date() } });
          sendLowStockAlertEmail({
            id: p.id, name: p.name, sku: p.sku, brand: p.brand,
            stockQty: p.stockQty, lowStockThreshold: p.lowStockThreshold,
          }).catch(console.error);
        }
      }
    })
    .catch(console.error);
}

/** Resets low/out-of-stock alert flags after stock is returned. Non-blocking. */
export function resetStockAlertFlags(productIds: string[]): void {
  if (productIds.length === 0) return;
  Promise.resolve()
    .then(async () => {
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, stockQty: true, lowStockThreshold: true, outOfStockAlertSentAt: true, lowStockAlertSentAt: true },
      });
      for (const p of products) {
        const updates: Record<string, null> = {};
        if (p.stockQty > 0 && p.outOfStockAlertSentAt) updates.outOfStockAlertSentAt = null;
        if (p.stockQty > p.lowStockThreshold && p.lowStockAlertSentAt) updates.lowStockAlertSentAt = null;
        if (Object.keys(updates).length > 0) {
          await prisma.product.update({ where: { id: p.id }, data: updates });
        }
      }
    })
    .catch(console.error);
}
