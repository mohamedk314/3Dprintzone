"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
  ordered_cod:  "COD – Pending",
  ordered_paid: "Paid",
  delivered:    "Delivered",
  canceled:     "Canceled",
};
const STATUS_COLORS: Record<string, string> = {
  ordered_cod:  "bg-amber-100 text-amber-700",
  ordered_paid: "bg-green-100 text-green-700",
  delivered:    "bg-indigo-100 text-indigo-700",
  canceled:     "bg-red-100 text-red-700",
};

interface Order {
  id: string; orderRef: string; status: string; paymentMethod: string;
  total: number; brand: string; createdAt: string;
  items: { productName: string; qty: number }[];
}

function DashboardSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 animate-pulse space-y-8">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-7 bg-gray-200 rounded-lg w-44" />
          <div className="h-4 bg-gray-100 rounded-lg w-56" />
        </div>
        <div className="h-9 bg-gray-100 rounded-lg w-24" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-[88px]" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-[88px]" />
        ))}
      </div>
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const [email,   setEmail]   = useState<string | null>(null);
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/customer/me",     { credentials: "include" }).then(r => r.json()),
      fetch("/api/customer/orders", { credentials: "include" }).then(r => r.json()),
    ]).then(([me, ord]) => {
      if (!me.success) { router.replace("/account/login"); return; }
      setEmail(me.data.email);
      setOrders(ord.data ?? []);
    }).finally(() => setLoading(false));
  }, [router]);

  async function logout() {
    await fetch("/api/customer/auth/logout", { method: "POST" });
    router.push("/");
  }

  if (loading) return <DashboardSkeleton />;
  if (!email)  return null;

  const total     = orders.length;
  const active    = orders.filter(o => o.status === "ordered_cod" || o.status === "ordered_paid").length;
  const delivered = orders.filter(o => o.status === "delivered").length;
  const canceled  = orders.filter(o => o.status === "canceled").length;
  const recent    = orders.slice(0, 3);

  const stats = [
    {
      label: "Total Orders", value: total,
      bg: "bg-indigo-50", text: "text-indigo-600",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />,
    },
    {
      label: "Active", value: active,
      bg: "bg-amber-50", text: "text-amber-600",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    },
    {
      label: "Delivered", value: delivered,
      bg: "bg-green-50", text: "text-green-600",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    },
    {
      label: "Canceled", value: canceled,
      bg: "bg-red-50", text: "text-red-500",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
          <p className="text-sm text-gray-500 mt-0.5 truncate max-w-xs">{email}</p>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {stats.map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl px-4 py-4`}>
            <div className="flex items-center gap-2 mb-2">
              <svg className={`w-4 h-4 ${s.text} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {s.icon}
              </svg>
              <span className={`text-xs font-medium ${s.text}`}>{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Orders section */}
      {total === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-700 mb-1">No orders yet</h3>
          <p className="text-gray-400 text-sm mb-6">Your order history will appear here</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white font-bold px-7 py-3 rounded-full hover:bg-indigo-700 transition-colors text-sm active:scale-[0.97]"
          >
            Start Shopping
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/account/orders" className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
              View all →
            </Link>
          </div>

          <div className="space-y-2.5 mb-8">
            {recent.map(order => (
              <div key={order.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-mono text-xs text-gray-400">{order.orderRef}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      {" · "}{order.brand === "rayk" ? "RAYK" : "3Dprintzone"}
                    </p>
                  </div>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-1 mb-2">
                  {order.items.map((item, i) => (
                    <span key={i}>{item.productName}{item.qty > 1 ? ` ×${item.qty}` : ""}{i < order.items.length - 1 ? ", " : ""}</span>
                  ))}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <p className="text-sm font-semibold text-gray-900">{Number(order.total).toFixed(0)} EGP</p>
                  <Link
                    href={`/track-order?ref=${order.orderRef}`}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                  >
                    Track →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/account/orders"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold px-5 py-3 rounded-full hover:bg-indigo-700 transition-colors text-sm active:scale-[0.97]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              View All Orders
            </Link>
            <Link
              href="/shop"
              className="flex-1 inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-semibold px-5 py-3 rounded-full hover:bg-gray-50 transition-colors text-sm active:scale-[0.97]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Continue Shopping
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
