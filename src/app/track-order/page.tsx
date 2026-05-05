"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Order {
  id: string;
  orderRef: string;
  status: string;
  paymentMethod: string;
  customerName: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: string;
  address?: {
    governorate: string;
    city: string;
    area?: string | null;
    addressLine1: string;
    addressLine2?: string | null;
  } | null;
  items?: {
    productName: string;
    sku?: string | null;
    qty: number;
    unitPrice: number;
    lineTotal: number;
  }[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string; step: number }> = {
  ordered_cod:  { label: "Order Placed",       color: "text-blue-600 bg-blue-50 border-blue-200",   icon: "📦", step: 1 },
  ordered_paid: { label: "Payment Confirmed",  color: "text-green-600 bg-green-50 border-green-200", icon: "✅", step: 2 },
  delivered:    { label: "Delivered",          color: "text-indigo-600 bg-indigo-50 border-indigo-200", icon: "🎉", step: 3 },
  canceled:     { label: "Canceled",           color: "text-red-600 bg-red-50 border-red-200",       icon: "❌", step: 0 },
};

function TrackOrderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [ref, setRef] = useState(searchParams.get("ref") ?? "");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  async function searchOrder(orderRef: string) {
    if (!orderRef.trim()) return;
    setLoading(true);
    setNotFound(false);
    setOrder(null);
    try {
      const res = await fetch(`/api/storefront/orders/${orderRef.trim()}`, { credentials: "include" });
      if (res.status === 404) { setNotFound(true); return; }
      const data = await res.json();
      setOrder(data?.data ?? null);
      router.replace(`/track-order?ref=${orderRef.trim()}`);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const refParam = searchParams.get("ref");
    if (refParam) {
      setRef(refParam);
      searchOrder(refParam);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusInfo = order ? (STATUS_CONFIG[order.status] ?? { label: order.status, color: "text-gray-600 bg-gray-50 border-gray-200", icon: "📋", step: 1 }) : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
        <p className="text-gray-500">Enter your order reference to check the status</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchOrder(ref)}
            placeholder="e.g. ORD-XXXXXXXX"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 font-mono"
          />
          <button
            onClick={() => searchOrder(ref)}
            disabled={loading || !ref.trim()}
            className="bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? "..." : "Track"}
          </button>
        </div>
      </div>

      {/* Not found */}
      {notFound && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-center">
          <p className="font-semibold">Order not found</p>
          <p className="text-sm mt-1">Please check the reference number and try again</p>
        </div>
      )}

      {/* Order details */}
      {order && statusInfo && (
        <div className="space-y-4">
          {/* Status card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Order Reference</p>
                <p className="font-mono font-bold text-gray-900 text-lg">{order.orderRef}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString("en-EG", { dateStyle: "long" })}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold ${statusInfo.color}`}>
                <span>{statusInfo.icon}</span>
                {statusInfo.label}
              </span>
            </div>

            {/* Progress bar */}
            {order.status !== "canceled" && (
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  {[
                    { label: "Placed", step: 1 },
                    { label: "Confirmed", step: 2 },
                    { label: "Delivered", step: 3 },
                  ].map((s, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 ${
                        statusInfo.step >= s.step
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "bg-white border-gray-200 text-gray-300"
                      }`}>
                        {statusInfo.step > s.step ? "✓" : s.step}
                      </div>
                      <span className={`text-xs font-medium ${statusInfo.step >= s.step ? "text-indigo-600" : "text-gray-400"}`}>{s.label}</span>
                    </div>
                  ))}
                </div>
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 -z-0">
                  <div
                    className="h-full bg-indigo-600 transition-all"
                    style={{ width: statusInfo.step === 1 ? "0%" : statusInfo.step === 2 ? "50%" : "100%" }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Order items */}
          {order.items && order.items.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      {item.sku && <p className="text-xs text-gray-400">SKU: {item.sku}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600">{item.qty} × {Number(item.unitPrice).toFixed(0)} EGP</p>
                      <p className="font-bold text-gray-900">{Number(item.lineTotal).toFixed(0)} EGP</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-4 pt-3 flex justify-between text-sm font-bold text-gray-900">
                <span>Total</span>
                <span>{Number(order.total).toFixed(0)} EGP</span>
              </div>
            </div>
          )}

          {/* Delivery address */}
          {order.address && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-3">Delivery Address</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {order.address.addressLine1}
                {order.address.addressLine2 && `, ${order.address.addressLine2}`}
                <br />
                {order.address.area && `${order.address.area}, `}
                {order.address.city}, {order.address.governorate}
              </p>
            </div>
          )}

          {/* Contact info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-3">Customer Info</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Name:</span> {order.customerName}</p>
              <p><span className="font-medium">Payment:</span> {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}</p>
            </div>
          </div>

          {/* Need help */}
          <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-5 text-center">
            <p className="text-sm text-indigo-700 font-medium mb-2">Need help with your order?</p>
            <a
              href={`https://wa.me/201012708316?text=Hi, I need help with order ${order.orderRef}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 text-white font-semibold text-sm px-5 py-2 rounded-full hover:bg-green-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* No search yet */}
      {!order && !loading && !notFound && (
        <div className="text-center py-8 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm">Enter your order reference above to track it</p>
          <p className="text-xs mt-1">You received the reference in your order confirmation</p>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPageWrapper() {
  return (
    <Suspense>
      <TrackOrderPage />
    </Suspense>
  );
}
