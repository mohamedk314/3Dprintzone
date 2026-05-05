"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Order {
  id: string;
  orderRef: string;
  customerName: string;
  email: string;
  phone: string;
  status: string;
  paymentMethod: string;
  total: number;
  createdAt: string;
  _count: { items: number };
}

interface Meta { total: number; page: number; pages: number }

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "ordered_cod", label: "COD Placed" },
  { value: "ordered_paid", label: "Paid" },
  { value: "delivered", label: "Delivered" },
  { value: "canceled", label: "Canceled" },
];

const STATUS_COLORS: Record<string, string> = {
  ordered_cod:  "bg-blue-100 text-blue-700",
  ordered_paid: "bg-green-100 text-green-700",
  delivered:    "bg-indigo-100 text-indigo-700",
  canceled:     "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  ordered_cod: "COD", ordered_paid: "Paid", delivered: "Delivered", canceled: "Canceled",
};

function OrdersPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);

  const status = searchParams.get("status") ?? "";
  const search = searchParams.get("search") ?? "";
  const page   = Number(searchParams.get("page") ?? "1");
  const [searchInput, setSearchInput] = useState(search);

  function setParam(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value); else p.delete(key);
    p.set("page", "1");
    router.push(`/admin/orders?${p.toString()}`);
  }

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams({ page: String(page), limit: "20" });
    if (status) p.set("status", status);
    if (search) p.set("search", search);
    fetch(`/api/admin/orders?${p.toString()}`)
      .then((r) => r.json())
      .then((d) => { setOrders(d?.data ?? []); setMeta(d?.meta ?? null); })
      .finally(() => setLoading(false));
  }, [status, search, page]);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Orders</h1>
        {meta && <p className="text-sm text-gray-500 mt-0.5">{meta.total} total</p>}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={(e) => { e.preventDefault(); setParam("search", searchInput); }} className="flex gap-2 flex-1">
          <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name, email, order ref..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white"
          />
          <button type="submit" className="border border-gray-200 bg-white text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50">Search</button>
        </form>
        <select value={status} onChange={(e) => setParam("status", e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400"
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No orders found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Order</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Items</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-mono text-xs font-medium text-gray-900">{order.orderRef}</p>
                        <p className="text-xs text-gray-400 capitalize">{order.paymentMethod}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900 text-sm">{order.customerName}</p>
                        <p className="text-xs text-gray-400">{order.phone}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{order._count.items}</td>
                      <td className="px-5 py-3 font-semibold text-gray-900">{Number(order.total).toFixed(0)} EGP</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("en-EG")}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link href={`/admin/orders/${order.id}`}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta && meta.pages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">Page {meta.page} of {meta.pages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setParam("page", String(page - 1))} disabled={page <= 1}
                    className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                  >
                    ← Prev
                  </button>
                  <button onClick={() => setParam("page", String(page + 1))} disabled={page >= meta.pages}
                    className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return <Suspense><OrdersPageInner /></Suspense>;
}
