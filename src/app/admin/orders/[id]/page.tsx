"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { generateOrderPDF } from "@/lib/utils/pdf";

interface OrderItem { id: string; productName: string; sku: string | null; qty: number; unitPrice: number; lineTotal: number }
interface Address { governorate: string; city: string; area: string | null; addressLine1: string; addressLine2: string | null; building: string | null; floor: string | null; apartment: string | null; landmark: string | null }
interface Order {
  id: string; orderRef: string; customerName: string; email: string; phone: string;
  status: string; paymentMethod: string; subtotal: number; shippingFee: number; total: number;
  notes: string | null; createdAt: string; updatedAt: string; brand: string;
  shipmentStatus: string | null; trackingNumber: string | null; courierName: string | null;
  estimatedDelivery: string | null;
  shippingMethod: { id: string; name: string; estimatedDays: number } | null;
  shippingZone: { id: string; name: string; estimatedDaysMin: number; estimatedDaysMax: number } | null;
  address: Address | null; items: OrderItem[];
}

const STATUS_OPTIONS = [
  { value: "ordered_cod",  label: "COD Placed" },
  { value: "ordered_paid", label: "Payment Confirmed" },
  { value: "delivered",    label: "Delivered" },
  { value: "canceled",     label: "Canceled" },
];

const SHIPMENT_STATUS_OPTIONS = [
  { value: "",              label: "Not set" },
  { value: "pending",       label: "Pending" },
  { value: "confirmed",     label: "Confirmed" },
  { value: "packed",        label: "Packed" },
  { value: "shipped",       label: "Shipped" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered",     label: "Delivered" },
  { value: "returned",      label: "Returned" },
  { value: "canceled",      label: "Canceled" },
];

const STATUS_COLORS: Record<string, string> = {
  ordered_cod:  "bg-blue-100 text-blue-700",
  ordered_paid: "bg-green-100 text-green-700",
  delivered:    "bg-indigo-100 text-indigo-700",
  canceled:     "bg-red-100 text-red-700",
};

const SHIPMENT_COLORS: Record<string, string> = {
  pending:         "bg-gray-100 text-gray-600",
  confirmed:       "bg-blue-100 text-blue-700",
  packed:          "bg-amber-100 text-amber-700",
  shipped:         "bg-indigo-100 text-indigo-700",
  out_for_delivery: "bg-orange-100 text-orange-700",
  delivered:       "bg-green-100 text-green-700",
  returned:        "bg-red-100 text-red-700",
  canceled:        "bg-red-100 text-red-700",
};

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [newStatus, setNewStatus] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newShippingFee, setNewShippingFee] = useState("");
  const [newShipmentStatus, setNewShipmentStatus] = useState("");
  const [newTrackingNumber, setNewTrackingNumber] = useState("");
  const [newCourierName, setNewCourierName] = useState("");
  const [newEstimatedDelivery, setNewEstimatedDelivery] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [downloading, setDownloading] = useState(false);

  async function handleDownloadPDF() {
    if (!order) return;
    setDownloading(true);
    try { await generateOrderPDF(order); } finally { setDownloading(false); }
  }

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
        setNewShipmentStatus(o?.shipmentStatus ?? "");
        setNewTrackingNumber(o?.trackingNumber ?? "");
        setNewCourierName(o?.courierName ?? "");
        setNewEstimatedDelivery(o?.estimatedDelivery ? new Date(o.estimatedDelivery).toISOString().split("T")[0] : "");
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
      if (newShipmentStatus !== (order.shipmentStatus ?? "")) body.shipmentStatus = newShipmentStatus || null;
      if (newTrackingNumber !== (order.trackingNumber ?? "")) body.trackingNumber = newTrackingNumber;
      if (newCourierName !== (order.courierName ?? "")) body.courierName = newCourierName;
      const existingDelivery = order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().split("T")[0] : "";
      if (newEstimatedDelivery !== existingDelivery) body.estimatedDelivery = newEstimatedDelivery || null;

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
        setNewShipmentStatus(data.data.shipmentStatus ?? "");
        setNewTrackingNumber(data.data.trackingNumber ?? "");
        setNewCourierName(data.data.courierName ?? "");
        setNewEstimatedDelivery(data.data.estimatedDelivery ? new Date(data.data.estimatedDelivery).toISOString().split("T")[0] : "");
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
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/admin/orders" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3 flex-wrap flex-1">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-mono">{order.orderRef}</h1>
            <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString("en-EG")}</p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"}`}>
            {STATUS_OPTIONS.find((s) => s.value === order.status)?.label ?? order.status}
          </span>
        </div>
        <div className="flex gap-2 ml-auto">
          <button onClick={handleDownloadPDF} disabled={downloading}
            className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1.5 rounded-lg disabled:opacity-60 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {downloading ? "..." : "Download PDF"}
          </button>
          <Link href={`/admin/orders/${order.id}/invoice`} target="_blank"
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-indigo-600 border border-gray-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Invoice
          </Link>
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

      {/* Shipping & Shipment Info */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 text-sm mb-3">Shipping & Shipment</h2>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          {order.shippingZone && (
            <div>
              <dt className="text-xs text-gray-500">Zone</dt>
              <dd className="font-medium text-gray-900">{order.shippingZone.name}</dd>
            </div>
          )}
          {order.shippingMethod && (
            <div>
              <dt className="text-xs text-gray-500">Method</dt>
              <dd className="font-medium text-gray-900">{order.shippingMethod.name}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-gray-500">Shipment Status</dt>
            <dd>
              {order.shipmentStatus ? (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SHIPMENT_COLORS[order.shipmentStatus] ?? "bg-gray-100 text-gray-600"}`}>
                  {SHIPMENT_STATUS_OPTIONS.find((s) => s.value === order.shipmentStatus)?.label ?? order.shipmentStatus}
                </span>
              ) : <span className="text-gray-400">Not set</span>}
            </dd>
          </div>
          {order.trackingNumber && (
            <div>
              <dt className="text-xs text-gray-500">Tracking #</dt>
              <dd className="font-mono font-medium text-gray-900">{order.trackingNumber}</dd>
            </div>
          )}
          {order.courierName && (
            <div>
              <dt className="text-xs text-gray-500">Courier</dt>
              <dd className="font-medium text-gray-900">{order.courierName}</dd>
            </div>
          )}
          {order.estimatedDelivery && (
            <div>
              <dt className="text-xs text-gray-500">Est. Delivery</dt>
              <dd className="font-medium text-gray-900">{new Date(order.estimatedDelivery).toLocaleDateString("en-EG", { dateStyle: "medium" })}</dd>
            </div>
          )}
        </dl>
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
                <label className="text-xs font-medium text-gray-700 mb-1 block">Order Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-white"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Shipment Status</label>
                <select value={newShipmentStatus} onChange={(e) => setNewShipmentStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-white"
                >
                  {SHIPMENT_STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Tracking Number</label>
                <input type="text" value={newTrackingNumber} onChange={(e) => setNewTrackingNumber(e.target.value)}
                  placeholder="e.g. 1Z999AA10123456784"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Courier Name</label>
                <input type="text" value={newCourierName} onChange={(e) => setNewCourierName(e.target.value)}
                  placeholder="e.g. Bosta, Aramex, DHL"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Estimated Delivery Date</label>
                <input type="date" value={newEstimatedDelivery} onChange={(e) => setNewEstimatedDelivery(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                />
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
