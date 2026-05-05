"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  categories: number;
  products: number;
  orders: number;
  pendingRequests: number;
}

interface RecentOrder {
  id: string;
  orderRef: string;
  customerName: string;
  status: string;
  total: number;
  createdAt: string;
}

interface RecentRequest {
  id: string;
  fullName: string;
  requestType: string;
  status: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  ordered_cod:  "bg-blue-100 text-blue-700",
  ordered_paid: "bg-green-100 text-green-700",
  delivered:    "bg-indigo-100 text-indigo-700",
  canceled:     "bg-red-100 text-red-700",
  pending:      "bg-amber-100 text-amber-700",
  reviewed:     "bg-blue-100 text-blue-700",
  approved:     "bg-green-100 text-green-700",
  rejected:     "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  ordered_cod: "COD", ordered_paid: "Paid", delivered: "Delivered", canceled: "Canceled",
  pending: "Pending", reviewed: "Reviewed", approved: "Approved", rejected: "Rejected",
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch("/api/admin/products?limit=1").then((r) => r.json()),
      fetch("/api/admin/orders?limit=5").then((r) => r.json()),
      fetch("/api/admin/custom-requests?status=pending&limit=1").then((r) => r.json()),
    ]).then(([cats, prods, orders, pending]) => {
      setStats({
        categories: cats?.data?.length ?? 0,
        products: prods?.meta?.total ?? 0,
        orders: orders?.meta?.total ?? 0,
        pendingRequests: pending?.meta?.total ?? 0,
      });
      setRecentOrders(orders?.data ?? []);
    });

    fetch("/api/admin/custom-requests?limit=5").then((r) => r.json())
      .then((d) => setRecentRequests(d?.data ?? []));
  }, []);

  const statCards = [
    { label: "Categories", value: stats?.categories, href: "/admin/categories", color: "bg-blue-500", icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    )},
    { label: "Products", value: stats?.products, href: "/admin/products", color: "bg-indigo-500", icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )},
    { label: "Orders", value: stats?.orders, href: "/admin/orders", color: "bg-orange-500", icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )},
    { label: "Pending Requests", value: stats?.pendingRequests, href: "/admin/custom-requests?status=pending", color: "bg-rose-500", icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    )},
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overview of your store</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href}
            className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow group"
          >
            <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center text-white mb-3`}>
              {card.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-0.5">
              {stats === null ? "—" : (card.value ?? 0)}
            </div>
            <div className="text-xs text-gray-500 group-hover:text-indigo-600 transition-colors">{card.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-sm">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-indigo-600 hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No orders yet</p>
            ) : recentOrders.map((order) => (
              <Link key={order.id} href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                  <p className="text-xs text-gray-400 font-mono">{order.orderRef}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{Number(order.total).toFixed(0)} EGP</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Custom Requests */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-sm">Custom Requests</h2>
            <Link href="/admin/custom-requests" className="text-xs text-indigo-600 hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentRequests.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No requests yet</p>
            ) : recentRequests.map((req) => (
              <Link key={req.id} href={`/admin/custom-requests/${req.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{req.fullName}</p>
                  <p className="text-xs text-gray-400 capitalize">{req.requestType}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[req.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {STATUS_LABELS[req.status] ?? req.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 text-sm mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/products/new" className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Product
          </Link>
          <Link href="/admin/categories" className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Manage Categories
          </Link>
          <Link href="/admin/orders" className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            View Orders
          </Link>
          <Link href="/" target="_blank" className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
