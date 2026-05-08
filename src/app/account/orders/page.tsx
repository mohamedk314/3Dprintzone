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

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          {email && <p className="text-sm text-gray-500 mt-0.5">{email}</p>}
        </div>
        <button onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
          Sign out
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm mb-4">No orders found for this email.</p>
          <Link href="/shop" className="text-indigo-600 text-sm hover:underline">Browse products →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
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
              <div className="text-sm text-gray-700 mb-3">
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
                    className="text-xs text-indigo-600 hover:underline font-medium">
                    Track
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
