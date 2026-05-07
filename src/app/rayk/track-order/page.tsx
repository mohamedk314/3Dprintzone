"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface OrderItem { productName: string; qty: number; unitPrice: number; lineTotal: number }
interface Order {
  id: string; orderRef: string; customerName: string; status: string;
  paymentMethod: string; subtotal: number; shippingFee: number; total: number;
  createdAt: string; items: OrderItem[];
  address: { governorate: string; city: string; addressLine1: string } | null;
}

const STATUS_LABELS: Record<string, string> = {
  ordered_cod: "Order Placed", ordered_paid: "Payment Confirmed",
  delivered: "Delivered", canceled: "Canceled",
};

function TrackOrderInner() {
  const searchParams = useSearchParams();
  const [ref, setRef] = useState(searchParams.get("ref") ?? "");
  const [input, setInput] = useState(searchParams.get("ref") ?? "");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(!!searchParams.get("ref"));
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/customer/me").then((r) => r.json()).then((d) => setIsLoggedIn(!!d.success));
  }, []);

  async function lookup(orderRef: string) {
    if (!orderRef.trim()) return;
    setLoading(true);
    setError(null);
    setOrder(null);
    const res = await fetch(`/api/storefront/orders/${orderRef.trim()}`, { credentials: "include" });
    const data = await res.json();
    if (data.success) {
      setOrder(data.data);
    } else {
      setError("Order not found. Check your reference number and try again.");
    }
    setLoading(false);
  }

  useEffect(() => {
    if (ref) lookup(ref);
  }, [ref]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRef(input);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Track Order</h1>
        <p className="text-xs text-black/40 tracking-widest uppercase">Enter your order reference number</p>
      </div>

      <div className="mb-6">
        <Link
          href={isLoggedIn ? "/account/orders" : "/account/login?redirect=/account/orders"}
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-black/50 hover:text-black transition-colors border-b border-black/20 hover:border-black pb-0.5"
        >
          View My Past Orders →
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-10">
        <input
          type="text" value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Order reference e.g. RYK-000001"
          className="flex-1 border border-black/20 px-4 py-3 text-sm focus:outline-none focus:border-black tracking-wide"
        />
        <button type="submit"
          className="border border-black px-6 py-3 text-xs font-semibold tracking-widest uppercase hover:bg-black hover:text-white transition-colors"
        >
          Track
        </button>
      </form>

      {loading && <p className="text-xs text-black/30 tracking-widest uppercase">Looking up order...</p>}

      {error && (
        <div className="border border-red-200 text-red-600 text-sm px-4 py-3">{error}</div>
      )}

      {order && (
        <div className="border border-black/5 divide-y divide-black/5">
          <div className="p-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-black/30 mb-1">Order Reference</p>
              <p className="font-mono text-lg font-bold">{order.orderRef}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-black/30 mb-1">Status</p>
              <span className={`text-xs font-semibold tracking-widest uppercase px-3 py-1 ${order.status === "delivered" ? "bg-black text-white" : order.status === "canceled" ? "bg-red-100 text-red-600" : "bg-gray-100 text-black"}`}>
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-2">
            <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-black/30 mb-3">Items</p>
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-black/70">{item.productName} <span className="text-black/30">×{item.qty}</span></span>
                <span className="font-medium">{Number(item.lineTotal).toFixed(0)} EGP</span>
              </div>
            ))}
          </div>

          <div className="p-6">
            <div className="flex justify-between text-xs text-black/40 mb-1.5 tracking-wide">
              <span>Subtotal</span><span>{Number(order.subtotal).toFixed(0)} EGP</span>
            </div>
            <div className="flex justify-between text-xs text-black/40 mb-3 tracking-wide">
              <span>Shipping</span><span>{Number(order.shippingFee).toFixed(0)} EGP</span>
            </div>
            <div className="flex justify-between text-sm font-bold tracking-wide border-t border-black/5 pt-3">
              <span>Total</span><span>{Number(order.total).toFixed(0)} EGP</span>
            </div>
          </div>

          {order.address && (
            <div className="p-6">
              <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-black/30 mb-2">Delivery To</p>
              <p className="text-sm text-black/60">{order.address.addressLine1}, {order.address.city}, {order.address.governorate}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RaykTrackOrderPage() {
  return <Suspense><TrackOrderInner /></Suspense>;
}
