"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { generateOrderPDF, type OrderPDFData } from "@/lib/utils/pdf";

type Order = OrderPDFData & { id: string; notes: string | null };

const STATUS_LABELS: Record<string, string> = {
  ordered_cod: "COD – Pending", ordered_paid: "Payment Confirmed",
  delivered: "Delivered", canceled: "Canceled",
};

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  async function handleDownloadPDF() {
    if (!order) return;
    setDownloading(true);
    try { await generateOrderPDF(order); } finally { setDownloading(false); }
  }

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((d) => setOrder(d?.data ?? null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center text-sm text-gray-400">Loading...</div>;
  if (!order) return <div className="p-8 text-center text-sm text-gray-500">Order not found.</div>;

  const brandName = order.brand === "rayk" ? "RAYK" : "3Dprintzone";
  const date = new Date(order.createdAt).toLocaleDateString("en-EG", { dateStyle: "long" });

  return (
    <>
      {/* Controls — hidden when printing */}
      <div className="print:hidden flex items-center gap-3 px-6 py-4 bg-gray-50 border-b border-gray-200">
        <Link href={`/admin/orders/${id}`} className="text-sm text-gray-500 hover:text-gray-700">← Back to Order</Link>
        <div className="ml-auto flex gap-2">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center gap-1.5 bg-indigo-600 text-white font-semibold text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {downloading ? "Generating..." : "Download PDF"}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 border border-gray-300 text-gray-700 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      </div>

      {/* Invoice — max width for screen, full width when printing */}
      <div className="max-w-2xl mx-auto p-8 print:max-w-none print:p-6 print:mx-0">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight">{brandName}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Cairo, Egypt</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-gray-900">INVOICE</h2>
            <p className="text-sm font-mono font-semibold text-gray-700 mt-0.5">{order.orderRef}</p>
            <p className="text-xs text-gray-500 mt-0.5">{date}</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 mb-6 pb-6 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Status:</span>
          <span className="text-sm font-semibold text-gray-900">{STATUS_LABELS[order.status] ?? order.status}</span>
          <span className="mx-2 text-gray-300">|</span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Payment:</span>
          <span className="text-sm font-semibold text-gray-900">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</span>
        </div>

        {/* Bill to */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Bill To</p>
            <p className="font-semibold text-gray-900">{order.customerName}</p>
            <p className="text-sm text-gray-600">{order.email}</p>
            <p className="text-sm text-gray-600">{order.phone}</p>
          </div>
          {order.address && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Ship To</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {order.address.addressLine1}
                {order.address.building && `, Bldg ${order.address.building}`}
                {order.address.floor && `, Fl. ${order.address.floor}`}
                {order.address.apartment && `, Apt ${order.address.apartment}`}
                <br />
                {order.address.area && `${order.address.area}, `}
                {order.address.city}, {order.address.governorate}
              </p>
            </div>
          )}
        </div>

        {/* Items table */}
        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-widest pb-2">Product</th>
              <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-widest pb-2 w-16">Qty</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-widest pb-2 w-24">Unit</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-widest pb-2 w-24">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-3 text-sm">
                  <p className="font-medium text-gray-900">{item.productName}</p>
                  {item.sku && <p className="text-xs text-gray-400 font-mono">{item.sku}</p>}
                </td>
                <td className="py-3 text-center text-sm text-gray-700">{item.qty}</td>
                <td className="py-3 text-right text-sm text-gray-700">{Number(item.unitPrice).toFixed(0)} EGP</td>
                <td className="py-3 text-right text-sm font-semibold text-gray-900">{Number(item.lineTotal).toFixed(0)} EGP</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-56 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span><span>{Number(order.subtotal).toFixed(0)} EGP</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping</span><span>{Number(order.shippingFee).toFixed(0)} EGP</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-2 mt-2">
              <span>Total</span><span>{Number(order.total).toFixed(0)} EGP</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Notes</p>
            <p className="text-sm text-gray-600">{order.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">Thank you for your order · {brandName} · Cairo, Egypt</p>
        </div>
      </div>

      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </>
  );
}
