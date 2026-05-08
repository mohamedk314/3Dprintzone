import { sendEmail } from "@/lib/email/nodemailer";
import { env } from "@/lib/utils/env";
import { prisma } from "@/lib/db/prisma";

async function getActiveAdminEmails(): Promise<string[]> {
  const admins = await prisma.adminUser.findMany({
    where: { isActive: true },
    select: { email: true },
  });
  return admins.map((a) => a.email);
}

const STATUS_LABELS: Record<string, string> = {
  ordered_cod: "Order Received (COD)",
  ordered_paid: "Payment Confirmed",
  delivered: "Delivered",
  canceled: "Canceled",
};

const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  packed: "Packed & Ready",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  returned: "Returned",
  canceled: "Canceled",
};

function baseLayout(content: string, brand: string = "3dprintzone") {
  const isRayk = brand === "rayk";
  const headerBg = isRayk ? "#000000" : "#4f46e5";
  const accentColor = isRayk ? "#000000" : "#4f46e5";
  const brandName = isRayk ? "RAYK" : "3Dprintzone";
  const headerStyle = isRayk
    ? `font-size:16px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase;`
    : `font-size:18px;font-weight:700;letter-spacing:-0.3px;`;

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
<div style="max-width:560px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
<div style="background:${headerBg};padding:24px 32px;">
  <h1 style="margin:0;color:#fff;${headerStyle}">${brandName}</h1>
</div>
<div style="padding:32px;">${content}</div>
<div style="padding:16px 32px;background:#f9fafb;border-top:1px solid #f3f4f6;">
  <p style="margin:0;font-size:11px;color:#9ca3af;">${brandName} · Cairo, Egypt</p>
</div>
</div></body></html>`.replace(/ACCENT/g, accentColor);
}

export async function sendOrderConfirmationEmail(order: {
  orderRef: string; customerName: string; email: string;
  total: number; paymentMethod: string; brand?: string;
  items: { productName: string; qty: number; lineTotal: number }[];
}) {
  const brand = order.brand ?? "3dprintzone";
  const accentColor = brand === "rayk" ? "#000000" : "#4f46e5";

  const itemRows = order.items.map(i =>
    `<tr><td style="padding:6px 0;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6;">${i.productName}</td>
     <td style="padding:6px 0;font-size:13px;color:#6b7280;text-align:center;border-bottom:1px solid #f3f4f6;">${i.qty}</td>
     <td style="padding:6px 0;font-size:13px;color:#111827;text-align:right;border-bottom:1px solid #f3f4f6;font-weight:600;">${Number(i.lineTotal).toFixed(0)} EGP</td></tr>`
  ).join("");

  const html = baseLayout(`
    <p style="margin:0 0 8px;font-size:14px;color:#6b7280;">Hi ${order.customerName},</p>
    <h2 style="margin:0 0 24px;font-size:20px;font-weight:700;color:#111827;">Order Confirmed ✓</h2>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:12px 16px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#166534;">Order Reference: <strong>${order.orderRef}</strong></p>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <thead><tr>
        <th style="text-align:left;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #f3f4f6;">Product</th>
        <th style="text-align:center;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #f3f4f6;">Qty</th>
        <th style="text-align:right;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #f3f4f6;">Total</th>
      </tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
    <div style="text-align:right;margin-bottom:24px;">
      <p style="margin:0;font-size:16px;font-weight:700;color:#111827;">Total: ${Number(order.total).toFixed(0)} EGP</p>
      <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Payment: ${order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</p>
    </div>
    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">We will notify you when your order status changes. Thank you for shopping with us!</p>
    <a href="${env.NEXT_PUBLIC_APP_URL}/track-order?ref=${order.orderRef}" style="display:inline-block;margin-top:20px;background:${accentColor};color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:600;">Track Your Order</a>
  `, brand);

  await sendEmail({ to: order.email, subject: `Order Confirmed – ${order.orderRef}`, html });
}

export async function sendNewOrderAdminEmail(order: {
  orderRef: string; customerName: string; email: string; phone: string;
  total: number; paymentMethod: string; brand: string;
}) {
  const to = await getActiveAdminEmails();
  if (to.length === 0) return;
  const html = baseLayout(`
    <h2 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#111827;">New Order Received</h2>
    <table style="width:100%;border-collapse:collapse;">
      ${[
        ["Order Ref", order.orderRef],
        ["Customer", order.customerName],
        ["Email", order.email],
        ["Phone", order.phone],
        ["Total", `${Number(order.total).toFixed(0)} EGP`],
        ["Payment", order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"],
        ["Brand", order.brand === "rayk" ? "RAYK" : "3Dprintzone"],
      ].map(([k, v]) => `<tr><td style="padding:8px 0;font-size:13px;color:#6b7280;width:120px;">${k}</td><td style="padding:8px 0;font-size:13px;color:#111827;font-weight:600;">${v}</td></tr>`).join("")}
    </table>
    <a href="${env.NEXT_PUBLIC_APP_URL}/admin/orders" style="display:inline-block;margin-top:24px;background:#4f46e5;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:600;">View in Admin</a>
  `);
  await sendEmail({ to, subject: `New Order – ${order.orderRef} [${order.brand.toUpperCase()}]`, html });
}

export async function sendOrderStatusUpdateEmail(order: {
  orderRef: string; customerName: string; email: string;
  status: string; total: number; brand?: string;
}) {
  const brand = order.brand ?? "3dprintzone";
  const label = STATUS_LABELS[order.status] ?? order.status;
  const accentBg = brand === "rayk" ? "#f0f0f0" : "#eff6ff";
  const accentBorder = brand === "rayk" ? "#d0d0d0" : "#bfdbfe";
  const accentText = brand === "rayk" ? "#111827" : "#1d4ed8";

  const html = baseLayout(`
    <p style="margin:0 0 8px;font-size:14px;color:#6b7280;">Hi ${order.customerName},</p>
    <h2 style="margin:0 0 24px;font-size:20px;font-weight:700;color:#111827;">Order Update</h2>
    <p style="margin:0 0 16px;font-size:14px;color:#374151;">Your order <strong>${order.orderRef}</strong> status has been updated:</p>
    <div style="background:${accentBg};border:1px solid ${accentBorder};border-radius:6px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:16px;font-weight:700;color:${accentText};">${label}</p>
    </div>
    <p style="margin:0;font-size:13px;color:#6b7280;">Order Total: <strong>${Number(order.total).toFixed(0)} EGP</strong></p>
  `, brand);
  await sendEmail({ to: order.email, subject: `Order Update – ${order.orderRef}`, html });
}

export async function sendNewCustomRequestAdminEmail(req: {
  fullName: string; email: string; phone: string; requestType: string; id: string;
}) {
  const to = await getActiveAdminEmails();
  if (to.length === 0) return;
  const html = baseLayout(`
    <h2 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#111827;">New Custom Request</h2>
    <table style="width:100%;border-collapse:collapse;">
      ${[
        ["Name", req.fullName],
        ["Email", req.email],
        ["Phone", req.phone],
        ["Type", req.requestType],
      ].map(([k, v]) => `<tr><td style="padding:8px 0;font-size:13px;color:#6b7280;width:80px;">${k}</td><td style="padding:8px 0;font-size:13px;color:#111827;font-weight:600;">${v}</td></tr>`).join("")}
    </table>
    <a href="${env.NEXT_PUBLIC_APP_URL}/admin/custom-requests/${req.id}" style="display:inline-block;margin-top:24px;background:#4f46e5;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:600;">View Request</a>
  `);
  await sendEmail({ to, subject: `New Custom Request – ${req.requestType}`, html });
}

export async function sendLowStockAlertEmail(product: {
  name: string; sku?: string | null; stockQty: number; lowStockThreshold: number;
  id: string; brand: string;
}) {
  const to = await getActiveAdminEmails();
  if (to.length === 0) return;
  const brandName = product.brand === "rayk" ? "RAYK" : "3Dprintzone";
  const html = baseLayout(`
    <h2 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#111827;">⚠️ Low Stock Alert</h2>
    <table style="width:100%;border-collapse:collapse;">
      ${[
        ["Product", product.name],
        ...(product.sku ? [["SKU", product.sku]] : []),
        ["Current Stock", String(product.stockQty)],
        ["Low Stock Threshold", String(product.lowStockThreshold)],
        ["Brand", brandName],
      ].map(([k, v]) => `<tr><td style="padding:8px 0;font-size:13px;color:#6b7280;width:160px;">${k}</td><td style="padding:8px 0;font-size:13px;color:#111827;font-weight:600;">${v}</td></tr>`).join("")}
    </table>
    <a href="${env.NEXT_PUBLIC_APP_URL}/admin/products/${product.id}" style="display:inline-block;margin-top:24px;background:#f59e0b;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:600;">View Product</a>
  `);
  await sendEmail({ to, subject: `[LOW STOCK] ${product.name}`, html });
}

export async function sendOutOfStockAlertEmail(product: {
  name: string; sku?: string | null; id: string; brand: string;
}) {
  const to = await getActiveAdminEmails();
  if (to.length === 0) return;
  const brandName = product.brand === "rayk" ? "RAYK" : "3Dprintzone";
  const html = baseLayout(`
    <h2 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#111827;">🚨 Out of Stock</h2>
    <table style="width:100%;border-collapse:collapse;">
      ${[
        ["Product", product.name],
        ...(product.sku ? [["SKU", product.sku]] : []),
        ["Current Stock", "0"],
        ["Brand", brandName],
      ].map(([k, v]) => `<tr><td style="padding:8px 0;font-size:13px;color:#6b7280;width:160px;">${k}</td><td style="padding:8px 0;font-size:13px;color:#111827;font-weight:600;">${v}</td></tr>`).join("")}
    </table>
    <a href="${env.NEXT_PUBLIC_APP_URL}/admin/products/${product.id}" style="display:inline-block;margin-top:24px;background:#ef4444;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:600;">Restock Product</a>
  `);
  await sendEmail({ to, subject: `[OUT OF STOCK] ${product.name}`, html });
}

export async function sendShipmentUpdateEmail(order: {
  orderRef: string; customerName: string; email: string;
  shipmentStatus: string; trackingNumber?: string;
  estimatedDelivery?: Date; brand?: string;
}) {
  const brand = order.brand ?? "3dprintzone";
  const label = SHIPMENT_STATUS_LABELS[order.shipmentStatus] ?? order.shipmentStatus;
  const accentColor = brand === "rayk" ? "#000000" : "#4f46e5";

  const statusIcon = order.shipmentStatus === "shipped" ? "🚚"
    : order.shipmentStatus === "out_for_delivery" ? "📍"
    : order.shipmentStatus === "delivered" ? "🎉" : "📦";

  const trackingRow = order.trackingNumber
    ? `<tr><td style="padding:6px 0;font-size:13px;color:#6b7280;width:160px;">Tracking Number</td><td style="padding:6px 0;font-size:13px;color:#111827;font-weight:600;">${order.trackingNumber}</td></tr>`
    : "";

  const deliveryRow = order.estimatedDelivery
    ? `<tr><td style="padding:6px 0;font-size:13px;color:#6b7280;width:160px;">Estimated Delivery</td><td style="padding:6px 0;font-size:13px;color:#111827;font-weight:600;">${new Date(order.estimatedDelivery).toLocaleDateString("en-EG", { dateStyle: "long" })}</td></tr>`
    : "";

  const html = baseLayout(`
    <p style="margin:0 0 8px;font-size:14px;color:#6b7280;">Hi ${order.customerName},</p>
    <h2 style="margin:0 0 24px;font-size:20px;font-weight:700;color:#111827;">${statusIcon} Shipment Update</h2>
    <p style="margin:0 0 16px;font-size:14px;color:#374151;">Your order <strong>${order.orderRef}</strong> has been updated:</p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:18px;font-weight:700;color:#166534;">${label}</p>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      ${trackingRow}
      ${deliveryRow}
    </table>
    <a href="${env.NEXT_PUBLIC_APP_URL}/track-order?ref=${order.orderRef}" style="display:inline-block;background:${accentColor};color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:600;">Track Your Order</a>
  `, brand);

  const subject = order.shipmentStatus === "shipped" ? `Your order has been shipped – ${order.orderRef}`
    : order.shipmentStatus === "out_for_delivery" ? `Out for delivery – ${order.orderRef}`
    : order.shipmentStatus === "delivered" ? `Order delivered – ${order.orderRef}`
    : `Shipment update – ${order.orderRef}`;

  await sendEmail({ to: order.email, subject, html });
}

export async function sendCustomerOtpEmail(email: string, code: string, brand: string = "3dprintzone") {
  const accentColor = brand === "rayk" ? "#000000" : "#4f46e5";
  const accentBg = brand === "rayk" ? "#f5f5f5" : "#f5f3ff";
  const accentBorder = brand === "rayk" ? "#d0d0d0" : "#ddd6fe";
  const html = baseLayout(`
    <h2 style="margin:0 0 24px;font-size:20px;font-weight:700;color:#111827;">Verify Your Email</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#374151;">Your one-time verification code is:</p>
    <div style="background:${accentBg};border:1px solid ${accentBorder};border-radius:8px;padding:20px;text-align:center;margin-bottom:24px;">
      <p style="margin:0;font-size:36px;font-weight:700;letter-spacing:8px;color:${accentColor};">${code}</p>
    </div>
    <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;">This code expires in 10 minutes. Do not share it with anyone.</p>
    <p style="margin:0;font-size:12px;color:#f59e0b;">Can't find this email? Please check your <strong>spam or junk folder</strong>.</p>
  `, brand);
  const brandName = brand === "rayk" ? "RAYK" : "3Dprintzone";
  await sendEmail({ to: email, subject: `Your verification code – ${brandName}`, html });
}
