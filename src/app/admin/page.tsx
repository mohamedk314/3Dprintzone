"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { LineChart, BarChart, HorizontalBars, type ChartPoint } from "@/components/admin/charts";

// ─── types ───────────────────────────────────────────────────────────────────

interface Kpis {
  totalRevenue:  number;
  codPendingAmt: number;
  paidCount:     number;
  codCount:      number;
  totalOrders:   number;
  avgOrderValue: number;
}
interface TimePoint  { date: string; revenue: number; orders: number; }
interface BrandPoint { brand: string; revenue: number; orders: number; }
interface PayPoint   { method: string; count: number; revenue: number; }
interface TopProduct { name: string; qty: number; revenue: number; }
interface AnalyticsData {
  kpis:            Kpis;
  timeSeries:      TimePoint[];
  brandComparison: BrandPoint[];
  paymentSplit:    PayPoint[];
  topProducts:     TopProduct[];
}

// ─── helpers ─────────────────────────────────────────────────────────────────

type Preset = "today" | "7d" | "30d" | "3m" | "12m" | "custom";

function getRange(preset: Preset, customFrom?: string, customTo?: string): { from: string; to: string } {
  const to  = new Date(); to.setHours(23, 59, 59, 999);
  const from = new Date();
  if (preset === "today") { from.setHours(0, 0, 0, 0); }
  else if (preset === "7d")  { from.setDate(from.getDate() - 6);   from.setHours(0, 0, 0, 0); }
  else if (preset === "30d") { from.setDate(from.getDate() - 29);  from.setHours(0, 0, 0, 0); }
  else if (preset === "3m")  { from.setMonth(from.getMonth() - 3); from.setHours(0, 0, 0, 0); }
  else if (preset === "12m") { from.setFullYear(from.getFullYear() - 1); from.setHours(0, 0, 0, 0); }
  else if (preset === "custom") {
    return {
      from: customFrom ? new Date(customFrom + "T00:00:00").toISOString() : from.toISOString(),
      to:   customTo   ? new Date(customTo   + "T23:59:59").toISOString() : to.toISOString(),
    };
  }
  return { from: from.toISOString(), to: to.toISOString() };
}

function egp(v: number) {
  return v.toLocaleString("en-EG", { maximumFractionDigits: 0 }) + " EGP";
}

function fmtDate(iso: string, rangePreset: Preset): string {
  const d = new Date(iso);
  if (rangePreset === "12m") {
    return d.toLocaleDateString("en-US", { month: "short" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function brandLabel(b: string) {
  return b === "rayk" ? "RAYK" : "3DPZ";
}

function downloadCsv(rows: string[][], filename: string) {
  const content = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob    = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url     = URL.createObjectURL(blob);
  const a       = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── component ───────────────────────────────────────────────────────────────

const PRESETS: { value: Preset; label: string }[] = [
  { value: "today", label: "Today"  },
  { value: "7d",    label: "7 Days" },
  { value: "30d",   label: "30 Days"},
  { value: "3m",    label: "3 Mo"   },
  { value: "12m",   label: "12 Mo"  },
  { value: "custom",label: "Custom" },
];

export default function AdminDashboardPage() {
  const [preset,     setPreset]     = useState<Preset>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo,   setCustomTo]   = useState("");
  const [data,       setData]       = useState<AnalyticsData | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [updatedAt,  setUpdatedAt]  = useState("");

  const load = useCallback(() => {
    const { from, to } = getRange(preset, customFrom, customTo);
    setLoading(true);
    fetch(`/api/admin/analytics?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setData(d.data);
          setUpdatedAt(new Date().toLocaleTimeString());
        }
      })
      .finally(() => setLoading(false));
  }, [preset, customFrom, customTo]);

  useEffect(() => { load(); }, [load]);

  // chart data
  const revenuePoints: ChartPoint[] = (data?.timeSeries ?? []).map((p) => ({
    label: fmtDate(p.date, preset),
    value: p.revenue,
  }));
  const ordersPoints: ChartPoint[] = (data?.timeSeries ?? []).map((p) => ({
    label: fmtDate(p.date, preset),
    value: p.orders,
  }));
  const brandRevPoints: ChartPoint[] = (data?.brandComparison ?? []).map((b) => ({
    label: brandLabel(b.brand),
    value: b.revenue,
  }));
  const brandOrdPoints: ChartPoint[] = (data?.brandComparison ?? []).map((b) => ({
    label: brandLabel(b.brand),
    value: b.orders,
  }));
  const payRevPoints: ChartPoint[] = (data?.paymentSplit ?? []).map((p) => ({
    label: p.method === "cod" ? "COD" : "Online",
    value: p.revenue,
  }));
  const payCntPoints: ChartPoint[] = (data?.paymentSplit ?? []).map((p) => ({
    label: p.method === "cod" ? "COD" : "Online",
    value: p.count,
  }));

  function exportTopProducts() {
    if (!data) return;
    const rows = [
      ["Rank", "Product Name", "Units Sold", "Revenue (EGP)"],
      ...data.topProducts.map((p, i) => [
        String(i + 1), p.name, String(p.qty), p.revenue.toFixed(2),
      ]),
    ];
    downloadCsv(rows, "top-products.csv");
  }

  async function exportOrders() {
    const { from, to } = getRange(preset, customFrom, customTo);
    const res  = await fetch(`/api/admin/orders?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&limit=10000`);
    const json = await res.json();
    if (!json.success) return;
    const rows = [
      ["Order Ref", "Customer", "Email", "Status", "Payment", "Brand", "Total (EGP)", "Date"],
      ...json.data.map((o: {
        orderRef: string; customerName: string; email: string;
        status: string; paymentMethod: string; brand: string;
        total: number; createdAt: string;
      }) => [
        o.orderRef, o.customerName, o.email, o.status, o.paymentMethod,
        o.brand, Number(o.total).toFixed(2),
        new Date(o.createdAt).toLocaleString(),
      ]),
    ];
    downloadCsv(rows, "orders.csv");
  }

  const kpis = data?.kpis;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
          {updatedAt && <p className="text-xs text-gray-400 mt-0.5">Updated {updatedAt}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Range presets */}
          <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
            {PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPreset(p.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  preset === p.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom date pickers */}
          {preset === "custom" && (
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-indigo-400"
              />
              <span className="text-xs text-gray-400">–</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-indigo-400"
              />
              <button
                onClick={load}
                className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Apply
              </button>
            </div>
          )}

          {/* Export orders */}
          <button
            onClick={exportOrders}
            className="inline-flex items-center gap-1.5 text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors press"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Orders
          </button>

          {/* Refresh */}
          <button
            onClick={load}
            disabled={loading}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50 press"
          >
            <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Revenue",   value: kpis ? egp(kpis.totalRevenue)  : "—", sub: "Non-canceled", color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "COD Pending",     value: kpis ? egp(kpis.codPendingAmt) : "—", sub: "Awaiting delivery", color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Paid Orders",     value: kpis ? kpis.paidCount.toString() : "—", sub: "Paid + delivered", color: "text-green-600", bg: "bg-green-50" },
          { label: "COD Orders",      value: kpis ? kpis.codCount.toString()  : "—", sub: "Cash on delivery", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Total Orders",    value: kpis ? kpis.totalOrders.toString() : "—", sub: "All statuses", color: "text-gray-700", bg: "bg-gray-50" },
          { label: "Avg Order Value", value: kpis ? egp(kpis.avgOrderValue)  : "—", sub: "Per non-canceled", color: "text-purple-600", bg: "bg-purple-50" },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-4 transition-colors hover:border-gray-200">
            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${card.bg} mb-2`}>
              <div className={`w-2 h-2 rounded-full ${card.color.replace("text-", "bg-")}`} />
            </div>
            <div className={`text-xl font-bold ${card.color} leading-tight`}>
              {loading ? <span className="inline-block w-16 h-5 bg-gray-100 rounded animate-pulse" /> : card.value}
            </div>
            <div className="text-xs font-medium text-gray-700 mt-0.5">{card.label}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Time-series charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Revenue Over Time" subtitle={kpis ? egp(kpis.totalRevenue) : undefined} loading={loading}>
          <LineChart data={revenuePoints} color="#6366f1" fillColor="#6366f118" />
        </ChartCard>
        <ChartCard title="Orders Over Time" subtitle={kpis ? `${kpis.totalOrders} orders` : undefined} loading={loading}>
          <LineChart data={ordersPoints} color="#f59e0b" fillColor="#f59e0b18" />
        </ChartCard>
      </div>

      {/* Brand + Payment breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ChartCard title="Brand Revenue" subtitle="Non-canceled" loading={loading}>
          <BarChart data={brandRevPoints} color="#6366f1" />
        </ChartCard>
        <ChartCard title="Brand Orders" subtitle="Non-canceled" loading={loading}>
          <BarChart data={brandOrdPoints} color="#8b5cf6" />
        </ChartCard>
        <ChartCard title="Payment Revenue" subtitle="COD vs Online" loading={loading}>
          <HorizontalBars data={payRevPoints} color="#10b981" formatVal={(v) => egp(v)} />
        </ChartCard>
        <ChartCard title="Payment Orders" subtitle="COD vs Online" loading={loading}>
          <HorizontalBars data={payCntPoints} color="#f59e0b" formatVal={(v) => `${Math.round(v)} orders`} />
        </ChartCard>
      </div>

      {/* Top products */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">Top Products</h2>
            <p className="text-xs text-gray-400 mt-0.5">By revenue in selected period</p>
          </div>
          <button
            onClick={exportTopProducts}
            disabled={!data || data.topProducts.length === 0}
            className="inline-flex items-center gap-1.5 text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>

        {loading ? (
          <div className="p-5 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-50 rounded animate-pulse" />
            ))}
          </div>
        ) : !data || data.topProducts.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">No product sales in this period</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-10">#</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Product</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Units</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.topProducts.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-5 py-3 text-right text-gray-600 tabular-nums">{p.qty}</td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-900 tabular-nums">{egp(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 text-sm mb-3">Quick Links</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/products/new" className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors press shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
            </svg>
            New Product
          </Link>
          <Link href="/admin/categories"      className="text-sm border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors press">Manage Categories</Link>
          <Link href="/admin/orders"          className="text-sm border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors press">View Orders</Link>
          <Link href="/admin/custom-requests" className="text-sm border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors press">Custom Requests</Link>
          <Link href="/" target="_blank" className="inline-flex items-center gap-1.5 text-sm border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors press">
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

// ─── ChartCard wrapper ────────────────────────────────────────────────────────

function ChartCard({
  title,
  subtitle,
  loading,
  children,
}: {
  title:     string;
  subtitle?: string;
  loading:   boolean;
  children:  React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900 text-sm">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-4">
        {loading ? (
          <div className="h-28 w-full bg-gray-50 rounded-lg animate-pulse" />
        ) : (
          children
        )}
      </div>
    </div>
  );
}
