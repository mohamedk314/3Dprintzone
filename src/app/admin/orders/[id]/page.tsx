"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface OrderItem { id: string; productName: string; sku: string | null; qty: number; unitPrice: number; lineTotal: number }
interface Address { governorate: string; city: string; area: string | null; addressLine1: string; addressLine2: string | null; building: string | null; floor: string | null; apartment: string | null; landmark: string | null }
interface Order {
  id: string; orderRef: string; customerName: string; email: string; phone: string;
  status: string; paymentMethod: string; subtotal: number; shippingFee: number; total: number;
  notes: string | null; createdAt: string; updatedAt: string;
  address: Address | null; items: OrderItem[];
}

const STATUS_OPTIONS = [
  { value: "ordered_cod",  label: "COD Placed" },
  { value: "ordered_paid", label: "Payment Confirmed" },
  { value: "delivered",    label: "Delivered" },
  { value: "canceled",     label: "Canceled" },
];

const STATUS_COLORS: Record<string, string> = {
  ordered_cod:  "bg-blue-100 text-blue-700",
  ordered_paid: "bg-green-100 text-green-700",
  delivered:    "bg-indigo-100 text-indigo-700",
  canceled:     "bg-red-100 text-red-700",
};

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [newStatus, setNewStatus] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newShippingFee, setNewShippingFee] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => { if (r.status === 404) { setNotFound(true); return null; } return r.json(); })
      .then((d) => {
        if (!d) return;
        const o = d?.data;
        setOrder(o);
        setNewStatus(o?.status ?? "");
        setNewNotes(o?.notes ?? "");
        setNewShippingFee(String(o?.shippingFee ?? "0"));
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!order) return;
    setUpdating(true);
    setUpdateMsg(null);
    try {
      const body: Record<string, unknown> = {};
      if (newStatus !== order.status) body.status = newStatus;
      if (newNotes !== (order.notes ?? "")) body.notes = newNotes;
      if (Number(newShippingFee) !== Number(order.shippingFee)) body.shippingFee = Number(newShippingFee);

      if (Object.keys(body).length === 0) { setUpdateMsg({ text: "No changes made.", ok: true }); setUpdating(false); return; }

      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        setNewStatus(data.data.status);
        setNewNotes(data.data.notes ?? "");
        setNewShippingFee(String(data.data.shippingFee));
        setUpdateMsg({ text: "Order updated successfully.", ok: true });
      } else {
        setUpdateMsg({ text: data.message || "Update failed.", ok: false });
      }
    } catch {
      setUpdateMsg({ text: "Network error.", ok: false });
    } finally {
      setUpdating(false);
      setTimeout(() => setUpdateMsg(null), 4000);
    }
  }

  if (loading) {
    return (
      <div className="p-6 animate-pulse space-y-4 max-w-4xl">
        <div className="h-6 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 bg-white rounded-xl border border-gray-100" />)}
        </div>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Order not found.</p>
        <Link href="/admin/orders" className="text-indigo-600 hover:underline text-sm mt-2 block">← Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-mono">{order.orderRef}</h1>
            <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString("en-EG")}</p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"}`}>
            {STATUS_OPTIONS.find((s) => s.value === order.status)?.label ?? order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 text-sm mb-3">Customer</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2"><dt className="text-gray-500 w-20 shrink-0">Name</dt><dd className="font-medium text-gray-900">{order.customerName}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-500 w-20 shrink-0">Email</dt><dd className="text-gray-700">{order.email}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-500 w-20 shrink-0">Phone</dt><dd className="text-gray-700">{order.phone}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-500 w-20 shrink-0">Payment</dt><dd className="capitalize text-gray-700">{order.paymentMethod}</dd></div>
          </dl>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 text-sm mb-3">Delivery Address</h2>
          {order.address ? (
            <address className="text-sm text-gray-700 not-italic leading-relaxed">
              {order.address.addressLine1}
              {order.address.building && `, Bldg ${order.address.building}`}
              {order.address.floor && `, Floor ${order.address.floor}`}
              {order.address.apartment && `, Apt ${order.address.apartment}`}
              <br />
              {order.address.area && `${order.address.area}, `}
              {order.address.city}, {order.address.governorate}
              {order.address.landmark && <><br /><span className="text-gray-400">Near: {order.address.landmark}</span></>}
            </address>
          ) : <p className="text-sm text-gray-400">No address on record.</p>}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">Order Items</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-2 text-xs font-semibold text-gray-500">Product</th>
              <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500">Qty</th>
              <th className="text-right px-5 py-2 text-xs font-semibold text-gray-500">Unit Price</th>
              <th className="text-right px-5 py-2 text-xs font-semibold text-gray-500">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-900">{item.productName}</p>
                  {item.sku && <p className="text-xs text-gray-400 font-mono">{item.sku}</p>}
                </td>
                <td className="px-3 py-3 text-center text-gray-700">{item.qty}</td>
                <td className="px-5 py-3 text-right text-gray-700">{Number(item.unitPrice).toFixed(0)} EGP</td>
                <td className="px-5 py-3 text-right font-semibold text-gray-900">{Number(item.lineTotal).toFixed(0)} EGP</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-gray-100 bg-gray-50">
            <tr>
              <td colSpan={3} className="px-5 py-2 text-right text-sm text-gray-500">Subtotal</td>
              <td className="px-5 py-2 text-right text-sm font-medium text-gray-900">{Number(order.subtotal).toFixed(0)} EGP</td>
            </tr>
            <tr>
              <td colSpan={3} className="px-5 py-2 text-right text-sm text-gray-500">Shipping</td>
              <td className="px-5 py-2 text-right text-sm font-medium text-gray-900">{Number(order.shippingFee).toFixed(0)} EGP</td>
            </tr>
            <tr>
              <td colSpan={3} className="px-5 py-3 text-right text-sm font-bold text-gray-900">Total</td>
              <td className="px-5 py-3 text-right font-bold text-gray-900">{Number(order.total).toFixed(0)} EGP</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Update Order */}
      {order.status !== "canceled" && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 text-sm mb-4">Update Order</h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-white"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Shipping Fee (EGP)</label>
                <input type="number" min={0} step="0.01" value={newShippingFee}
                  onChange={(e) => setNewShippingFee(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Internal Notes</label>
              <textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)}
                rows={2} placeholder="Admin notes (not shown to customer)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 resize-none"
              />
            </div>
            {updateMsg && (
              <p className={`text-sm rounded-lg px-3 py-2 ${updateMsg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {updateMsg.text}
              </p>
            )}
            <button type="submit" disabled={updating}
              className="bg-indigo-600 text-white font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {updating ? "Updating..." : "Save Changes"}
            </button>
          </form>
        </div>
      )}

      {order.status === "canceled" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          This order has been canceled and cannot be updated.
        </div>
      )}
    </div>
  );
}
