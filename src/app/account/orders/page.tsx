"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
  ordered_cod: "COD – Pending", ordered_paid: "Paid", delivered: "Delivered", canceled: "Canceled",
};
const STATUS_COLORS: Record<string, string> = {
  ordered_cod:  "bg-amber-100 text-amber-700",
  ordered_paid: "bg-green-100 text-green-700",
  delivered:    "bg-indigo-100 text-indigo-700",
  canceled:     "bg-red-100 text-red-700",
};

const SHIPMENT_LABELS: Record<string, string> = {
  pending: "Pending", confirmed: "Confirmed", packed: "Packed",
  shipped: "Shipped", out_for_delivery: "Out for Delivery",
  delivered: "Delivered", returned: "Returned", canceled: "Canceled",
};
const SHIPMENT_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600", confirmed: "bg-blue-100 text-blue-700",
  packed: "bg-amber-100 text-amber-700", shipped: "bg-indigo-100 text-indigo-700",
  out_for_delivery: "bg-orange-100 text-orange-700", delivered: "bg-green-100 text-green-700",
  returned: "bg-red-100 text-red-700", canceled: "bg-red-100 text-red-700",
};

interface Order {
  id: string; orderRef: string; status: string; paymentMethod: string;
  total: number; brand: string; createdAt: string;
  shipmentStatus?: string | null;
  trackingNumber?: string | null;
  courierName?: string | null;
  estimatedDelivery?: string | null;
  items: { productName: string; qty: number }[];
  address?: { governorate: string; city: string; addressLine1: string } | null;
  shippingMethod?: { name: string } | null;
  shippingZone?: { name: string } | null;
}

function OrdersSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse">
      <div className="h-7 bg-gray-200 rounded w-36 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-48 mb-8" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 space-y-3">
            <div className="flex justify-between">
              <div className="h-3 bg-gray-200 rounded w-32" />
              <div className="h-5 bg-gray-200 rounded w-20" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-4/5" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-px bg-gray-100" />
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-3 bg-gray-200 rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AccountOrdersPage() {
  const router  = useRouter();
  const [email,   setEmail]   = useState<string | null>(null);
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/customer/me").then((r) => r.json()),
      fetch("/api/customer/orders").then((r) => r.json()),
    ]).then(([me, ord]) => {
      if (!me.success) { router.replace("/account/login"); return; }
      setEmail(me.data.email);
      setOrders(ord.data ?? []);
    }).finally(() => setLoading(false));
  }, [router]);

  async function logout() {
    await fetch("/api/customer/auth/logout", { method: "POST" });
    router.push("/account/login");
  }

  if (loading) return <OrdersSkeleton />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          {email && <p className="text-sm text-gray-500 mt-0.5">{email}</p>}
        </div>
        <button onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors active:scale-[0.97]">
          Sign out
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-700 mb-1">No orders yet</h3>
          <p className="text-gray-400 text-sm mb-6">Your order history will appear here</p>
          <Link
            href="/shop"
            className="inline-block bg-indigo-600 text-white font-bold px-8 py-3 rounded-full hover:bg-indigo-700 transition-colors text-sm active:scale-[0.97]"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs font-mono text-gray-400">{order.orderRef}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}
                    <span className="capitalize">{order.brand === "rayk" ? "RAYK" : "3Dprintzone"}</span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                  {order.shipmentStatus && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${SHIPMENT_COLORS[order.shipmentStatus] ?? "bg-gray-100 text-gray-600"}`}>
                      {SHIPMENT_LABELS[order.shipmentStatus] ?? order.shipmentStatus}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-700 mb-3 line-clamp-2">
                {order.items.map((item, i) => (
                  <span key={i}>{item.productName}{item.qty > 1 ? ` ×${item.qty}` : ""}{i < order.items.length - 1 ? ", " : ""}</span>
                ))}
              </div>
              {order.address && (
                <p className="text-xs text-gray-400 mb-2">{order.address.addressLine1}, {order.address.city}, {order.address.governorate}</p>
              )}
              {(order.shippingMethod || order.shippingZone) && (
                <p className="text-xs text-gray-400 mb-2">
                  {[order.shippingZone?.name, order.shippingMethod?.name].filter(Boolean).join(" · ")}
                </p>
              )}
              {order.trackingNumber && (
                <p className="text-xs text-indigo-600 mb-2 font-mono">Tracking: {order.trackingNumber}{order.courierName ? ` (${order.courierName})` : ""}</p>
              )}
              {order.estimatedDelivery && (
                <p className="text-xs text-gray-500 mb-2">Est. delivery: {new Date(order.estimatedDelivery).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</p>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <p className="text-sm font-semibold text-gray-900">{Number(order.total).toFixed(0)} EGP</p>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-gray-400">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</p>
                  <Link href={`/track-order?ref=${order.orderRef}`}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold border border-indigo-100 hover:border-indigo-300 px-2.5 py-1 rounded-lg transition-colors">
                    Track →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
