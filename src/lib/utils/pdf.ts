const STATUS_LABELS: Record<string, string> = {
  ordered_cod: "COD – Pending",
  ordered_paid: "Payment Confirmed",
  delivered: "Delivered",
  canceled: "Canceled",
};

export interface OrderPDFData {
  orderRef: string;
  customerName: string;
  email: string;
  phone: string;
  status: string;
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  notes?: string | null;
  createdAt: string;
  brand: string;
  address: {
    governorate: string; city: string; area?: string | null;
    addressLine1: string; addressLine2?: string | null;
    building?: string | null; floor?: string | null; apartment?: string | null;
  } | null;
  items: { productName: string; sku?: string | null; qty: number; unitPrice: number; lineTotal: number }[];
}

export async function generateOrderPDF(order: OrderPDFData): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const W = 210;
  const L = 20;           // left margin
  const R = W - L;        // right edge
  const CW = R - L;       // content width
  const COL2 = L + CW / 2 + 3; // second column start

  const brandName = order.brand === "rayk" ? "RAYK" : "3Dprintzone";
  const filename = `${order.brand === "rayk" ? "rayk" : "3dprintzone"}-${order.orderRef}.pdf`;

  const b = () => doc.setFont("helvetica", "bold");
  const n = () => doc.setFont("helvetica", "normal");
  const s = (v: number) => doc.setFontSize(v);
  const c = (r: number, g: number, b_: number) => doc.setTextColor(r, g, b_);
  const gray = () => c(100, 116, 139);
  const dark = () => c(17, 24, 39);
  const mid = () => c(75, 85, 99);
  const rt = (str: string, x: number, y: number) => {
    doc.text(str, x - doc.getTextWidth(str), y);
  };
  const rule = (y: number) => { doc.setDrawColor(229, 231, 235); doc.line(L, y, R, y); };

  // ── Header bar ──────────────────────────────────────────────────────────
  if (order.brand === "rayk") {
    doc.setFillColor(0, 0, 0);
  } else {
    doc.setFillColor(79, 70, 229);
  }
  doc.rect(0, 0, W, 30, "F");

  s(16); b(); c(255, 255, 255);
  doc.text(brandName, L, 19);

  s(10); n();
  rt("INVOICE", R, 19);

  // ── Order meta ──────────────────────────────────────────────────────────
  let y = 40;

  s(8); b(); gray();
  doc.text("ORDER REFERENCE", L, y);
  rt(new Date(order.createdAt).toLocaleDateString("en-EG", { dateStyle: "long" }), R, y);

  y += 5;
  s(11); b(); dark();
  doc.text(order.orderRef, L, y);

  y += 9;
  rule(y); y += 6;

  // status + payment on same row
  s(8); b(); gray();
  doc.text("STATUS", L, y);
  doc.text("PAYMENT", COL2, y);
  y += 5;
  s(10); b(); dark();
  doc.text(STATUS_LABELS[order.status] ?? order.status, L, y);
  doc.text(order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment", COL2, y);

  y += 10;
  rule(y); y += 6;

  // ── Bill To / Ship To ───────────────────────────────────────────────────
  s(8); b(); gray();
  doc.text("BILL TO", L, y);
  if (order.address) doc.text("SHIP TO", COL2, y);
  y += 5;

  s(10); b(); dark();
  doc.text(order.customerName, L, y);
  y += 5; n(); s(9); mid();
  doc.text(order.email, L, y);
  y += 4;
  doc.text(order.phone, L, y);

  if (order.address) {
    const addr = order.address;
    let line1 = addr.addressLine1;
    if (addr.building) line1 += `, Bldg ${addr.building}`;
    if (addr.floor) line1 += `, Fl. ${addr.floor}`;
    if (addr.apartment) line1 += `, Apt ${addr.apartment}`;
    let line2 = "";
    if (addr.area) line2 += `${addr.area}, `;
    line2 += `${addr.city}, ${addr.governorate}`;

    const shipYStart = y - 9;
    s(9); n(); mid();
    const wrapped = doc.splitTextToSize(line1, CW / 2 - 5);
    doc.text(wrapped, COL2, shipYStart);
    doc.text(line2, COL2, shipYStart + (wrapped.length * 4) + 2);
  }

  y += 12;
  rule(y); y += 6;

  // ── Items table ─────────────────────────────────────────────────────────
  const COL_QTY = L + 95;
  const COL_UNIT = L + 115;

  s(8); b(); gray();
  doc.text("PRODUCT", L, y);
  doc.text("QTY", COL_QTY, y);
  doc.text("UNIT", COL_UNIT, y);
  rt("TOTAL", R, y);
  y += 2;
  rule(y); y += 5;

  for (const item of order.items) {
    if (y > 258) { doc.addPage(); y = 20; }

    const nameLines = doc.splitTextToSize(item.productName, 88);
    s(9); b(); dark();
    doc.text(nameLines[0], L, y);
    if (nameLines.length > 1) {
      n(); mid();
      doc.text(nameLines[1], L, y + 4);
    }
    n(); mid();
    doc.text(String(item.qty), COL_QTY, y);
    doc.text(`${Number(item.unitPrice).toFixed(0)} EGP`, COL_UNIT, y);
    b(); dark();
    rt(`${Number(item.lineTotal).toFixed(0)} EGP`, R, y);

    if (item.sku) {
      y += 4; n(); s(7); c(156, 163, 175);
      doc.text(`SKU: ${item.sku}`, L, y);
      s(9);
    }
    y += nameLines.length > 1 ? 9 : 7;
  }

  rule(y); y += 7;

  // ── Totals ───────────────────────────────────────────────────────────────
  const TX = L + 90;
  s(9); n(); mid();
  doc.text("Subtotal", TX, y);
  rt(`${Number(order.subtotal).toFixed(0)} EGP`, R, y);
  y += 6;
  doc.text("Shipping", TX, y);
  rt(`${Number(order.shippingFee).toFixed(0)} EGP`, R, y);
  y += 2;
  doc.setDrawColor(229, 231, 235);
  doc.line(TX, y, R, y);
  y += 6;
  s(11); b(); dark();
  doc.text("Total", TX, y);
  rt(`${Number(order.total).toFixed(0)} EGP`, R, y);

  // ── Notes ────────────────────────────────────────────────────────────────
  if (order.notes) {
    y += 12;
    rule(y); y += 6;
    s(8); b(); gray();
    doc.text("NOTES", L, y);
    y += 5;
    n(); s(9); mid();
    const noteLines = doc.splitTextToSize(order.notes, CW);
    doc.text(noteLines, L, y);
  }

  // ── Footer ───────────────────────────────────────────────────────────────
  const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    const fy = 290;
    doc.setDrawColor(229, 231, 235);
    doc.line(L, fy - 4, R, fy - 4);
    s(8); n(); c(156, 163, 175);
    doc.text(`Thank you for your order · ${brandName} · Cairo, Egypt`, L, fy);
    if (pageCount > 1) rt(`Page ${p} of ${pageCount}`, R, fy);
  }

  doc.save(filename);
}
